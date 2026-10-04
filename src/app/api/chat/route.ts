import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Anda adalah Naufal AI Assistant di portofolio Naufal Maulana Izzuddin. Jawablah dengan ramah, profesional, dan ringkas dalam Bahasa Indonesia.
Konteks Naufal Maulana Izzuddin:
- Peran: Frontend Engineer, UI/UX Designer, & AI Automation Bot Developer dari Kebumen, Jawa Tengah.
- Pendidikan: Mahasiswa S1 Rekayasa Perangkat Lunak (RPL) di Telkom University Purwokerto (angkatan target lulus 2026).
- Proyek Unggulan:
  1. Commercial Laundry Operations Suite (Londri-Admin + Laundry Central): Project Lead & Frontend Engineer (Next.js App Router, React, TypeScript, Tailwind CSS).
  2. Patukrejomulyo E-Gov: Sistem pelaporan insiden fasilitas desa berbasis Google Maps spatial radar & AI auto-triage (100% QA pass, 32 skenario).
  3. AI Bot Scripting Labs: Background worker Python/Node.js terintegrasi LLM API, function calling, dan webhook dispatcher.
  4. Magang UI/UX Designer di PT Seven Inc (Yogyakarta): Mendesain 13+ halaman Titik Visual CMS dan alur ride-sharing Nebeng di Figma.
- Tech Stack: Next.js, React, TypeScript, Tailwind CSS, Python 3, Node.js, LLM APIs, Figma.
- Kontak: WhatsApp +62 857-7026-6735 | Email naufalmaulana806@gmail.com | GitHub github.com/SiNopaal | CV tersedia di website.`;

function getLocalKnowledgeResponse(userMessage: string): string {
  const query = userMessage.toLowerCase().trim();

  // Helper matcher
  const has = (...words: string[]) => words.some((w) => query.includes(w));

  // 1. BOT IDENTITY & CAPABILITIES
  if (
    has("kamu siapa", "bot apa", "bisa apa", "fitur", "bantuan", "help", "perintah", "tugasmu", "fungsi bot", "apa yang bisa")
  ) {
    return "Saya adalah AI Assistant yang mewakili Naufal Maulana Izzuddin! Saya dapat menjawab berbagai pertanyaan seputar:\n• Profil & latar belakang pendidikan Naufal di Telkom University Purwokerto\n• Keahlian teknis (Next.js, React, TypeScript, Python, LLM API, Figma)\n• Portofolio proyek (Laundry Suite, Patukrejomulyo E-Gov, AI Bot Labs, PT Seven Inc)\n• Layanan pembuatan website / bot dan kontak resmi Naufal.";
  }

  // 2. GREETINGS & CASUAL CHAT
  const isGreetingWord = has(
    "halo", "hai", "hello", "hey", "hei", "ping", "tes", "test",
    "pagi", "siang", "sore", "malam", "assalam", "kabar"
  ) || query === "p" || query.startsWith("p ") || query === "hi";

  if (isGreetingWord && query.length < 35) {
    return "Halo! 👋 Selamat datang di portofolio interaktif Naufal Maulana Izzuddin. Saya adalah Naufal AI Assistant. Ada yang bisa saya bantu seputar profil Naufal, keahlian frontend & bot AI, pengalaman proyek, atau tawaran kerja sama?";
  }

  // 3. EDUCATION / CAMPUS / TELKOM UNIVERSITY
  if (
    has(
      "kuliah", "kampus", "universitas", "telkom", "purwokerto", "jurusan",
      "rpl", "sekolah", "pendidikan", "lulus", "mahasiswa", "studi", "s1", "gelar"
    )
  ) {
    return "🎓 Naufal Maulana saat ini menempuh studi S1 Rekayasa Perangkat Lunak (Software Engineering) di Telkom University Purwokerto (angkatan target kelulusan 2026). Fokus studinya meliputi arsitektur web modern, rekayasa perangkat lunak, sistem AI otonom, dan Software Quality Assurance (QA).";
  }

  // 4. BIOGRAPHY / PROFILE / WHOAMI
  if (
    has(
      "siapa naufal", "whoami", "who is", "biodata", "profil", "tentang", "about",
      "asal", "tinggal", "umur", "orang mana", "kebumen", "owner", "pembuat"
    )
  ) {
    return "👤 Naufal Maulana Izzuddin adalah seorang Frontend Engineer, UI/UX Designer, dan AI Automation Bot Developer dari Kebumen, Jawa Tengah. Naufal menggabungkan keahlian arsitektur web modern (Next.js/React/TypeScript) dengan bot otomasi AI otonom (Python/Node.js/LLM APIs) serta desain antarmuka berkualitas tinggi di Figma.";
  }

  // 5. INTERNSHIP / PT SEVEN INC / UI UX DESIGN
  if (
    has("seven inc", "magang", "intern", "titik visual", "nebeng")
  ) {
    return "🎨 Pengalaman Magang di PT Seven Inc (Yogyakarta):\nNaufal menjabat sebagai UI/UX Designer Intern (Juni – Agustus 2025). Kontribusi utamanya meliputi perancangan Atomic Design Tokens di Figma, penyelesaian 13+ frame responsif untuk platform landing 'Titik Visual CMS', serta perancangan user journey 4 peran (driver, passenger, fleet, admin) pada aplikasi 'Nebeng'.";
  }

  // 6. COMMERCIAL LAUNDRY SUITE
  if (
    has("laundry", "londri", "wewolk")
  ) {
    return "🧺 Commercial Laundry Operations & Client Web Suite:\nProyek komersial nyata di mana Naufal bertindak sebagai Project Lead & Frontend Engineer. Terdiri dari:\n1. Londri-Admin: Dashboard operasional real-time untuk order queue, pelacakan proses cuci/setrika, dan grafik omzet harian.\n2. Laundry Central: Company profile komersial interaktif untuk meningkatkan konversi pelanggan.\nDibangun menggunakan Next.js App Router, React, TypeScript, dan Tailwind CSS.";
  }

  // 7. PATUKREJOMULYO E-GOV
  if (
    has("patukrejomulyo", "egov", "e-gov", "desa", "insiden", "radar", "maps", "bonorowo")
  ) {
    return "🗺️ Patukrejomulyo E-Gov • Public Incident Spatial Platform:\nPlatform pelaporan insiden fasilitas publik untuk Desa Patukrejomulyo, Kebumen. Memadukan Google Maps API spatial radar dan auto-triage AI untuk mengelompokkan laporan warga 50% lebih cepat. Naufal memimpin pengujian sistem Black-box pada 8 fitur & 32 skenario dengan hasil 100% QA pass.";
  }

  // 8. AI BOT SCRIPTING & AUTOMATION LABS
  if (
    has("bot", "otomasi", "automasi", "script", "scraping", "scraper", "worker", "webhook", "dispatcher", "llm api")
  ) {
    return "🤖 AI Bot Scripting & Automation Labs:\nNaufal mengembangkan sistem background worker otonom berbasis Python dan Node.js yang terhubung dengan API LLM. Fitur utama mencakup:\n• Ekstraksi dan perangkuman data web secara terjadwal\n• Rate-limiting guard & structured JSON function calling\n• Pengiriman event ke webhook dispatcher dengan retry otomatis (99.9% task success).";
  }

  // 9. TECH STACK & SKILLS
  if (
    has(
      "skill", "stack", "teknologi", "kemampuan", "tech", "bahasa", "tools",
      "framework", "coding", "next", "react", "typescript", "tailwind", "python",
      "node", "figma", "three", "database", "sql"
    )
  ) {
    return "💻 Curated Tech Arsenal Naufal Maulana:\n• Frontend: Next.js (App Router), React.js, TypeScript, Tailwind CSS, Three.js / React Three Fiber, Flutter\n• AI & Otomasi: Python 3, Node.js Bot Workers, LLM APIs (Gemini/OpenAI), Webhooks, Prompt Engineering\n• UI/UX Design: Figma, Design Tokens, Interactive Hi-Fi Prototyping, BRD Handoff Specs\n• Backend & Database: NestJS, Laravel, PostgreSQL, MySQL, Neon, Railway";
  }

  // 10. ALL PROJECTS OVERVIEW
  if (
    has("proyek", "project", "portofolio", "portfolio", "karya", "hasil kerja", "buat apa", "bikin apa")
  ) {
    return "✨ 4 Proyek Unggulan Naufal Maulana:\n1. 🧺 Commercial Laundry Suite: Sistem manajemen operasional laundry komersial (Next.js, TypeScript)\n2. 🗺️ Patukrejomulyo E-Gov: Platform pelaporan insiden fasilitas desa dengan Google Maps radar & AI auto-triage\n3. 🤖 AI Bot Scripting Labs: Background worker Python/Node.js terintegrasi LLM & Webhooks\n4. 🎨 PT Seven Inc UI/UX: Desain 13+ halaman Titik Visual & alur Nebeng di Figma.";
  }

  // 11. SERVICES / FREELANCE / HIRING
  if (
    has(
      "jasa", "bisa buat", "bisa bikin", "buatkan", "bikinkan", "harga", "biaya",
      "rate", "sewa", "order", "hire", "kerja sama", "rekrut", "freelance", "lowongan", "kontrak"
    )
  ) {
    return "🚀 Layanan & Ketersediaan Kerja Sama:\nNaufal Maulana saat ini terbuka untuk:\n• Posisi Frontend Engineer (Full-time / Remote / Hybrid)\n• Jasa pembuatan Website & Web Application interaktif (Next.js / React / Tailwind)\n• Pembuatan Bot Otomasi & Integrasi AI (Python / Node.js / Webhooks)\n• Perancangan UI/UX Design & Prototype di Figma\nSilakan diskusikan kebutuhan Anda langsung melalui WhatsApp: +62 857-7026-6735 atau Email: naufalmaulana806@gmail.com.";
  }

  // 12. CONTACT & SOCIAL MEDIA
  if (
    has(
      "kontak", "contact", "hubungi", "whatsapp", "wa", "nomor", "no hp",
      "email", "gmail", "linkedin", "github", "dm", "sosmed", "chat", "telepon"
    )
  ) {
    return "📬 Kontak Resmi Naufal Maulana:\n• WhatsApp: +62 857-7026-6735 (https://wa.me/6285770266735)\n• Email: naufalmaulana806@gmail.com\n• LinkedIn: linkedin.com/in/naufalmaulanaizzuddin\n• GitHub: github.com/SiNopaal\n• CV Online: /Resume-Naufal Maulana.html";
  }

  // 13. CV / RESUME
  if (
    has("cv", "resume", "curriculum vitae", "unduh cv", "download cv")
  ) {
    return "📄 Anda dapat mengunduh atau melihat CV terbaru Naufal Maulana secara langsung dengan mengklik tombol 'CV' pada navbar atas atau membuka link /Resume-Naufal Maulana.html pada website ini.";
  }

  // 14. THANK YOU & POLITE FEEDBACK
  if (
    has("makasih", "terima kasih", "thanks", "thank you", "mantap", "oke", "ok", "sip", "siap", "keren", "bagus", "hebat")
  ) {
    return "Sama-sama! Senang bisa membantu Anda. Jika ada hal lain yang ingin Anda ketahui seputar Naufal Maulana atau butuh bantuan lebih lanjut, jangan ragu untuk bertanya lagi ya! 😊";
  }

  // 15. DYNAMIC SMART CONTEXTUAL FALLBACK
  return `Terima kasih atas pertanyaannya! Terkait "${userMessage}", sebagai AI Assistant Naufal, saya dapat memberikan informasi mendalam seputar:\n• Keahlian frontend Next.js/React & UI/UX Figma\n• Bot otomasi Python/Node.js & integrasi LLM API\n• Pengalaman memimpin proyek Laundry Suite & Patukrejomulyo E-Gov\n• Studi di Telkom University Purwokerto atau kontak langsung Naufal.\n\nAda topik tertentu yang ingin Anda telusuri lebih detail?`;
}

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Format request tidak valid." },
        { status: 400 }
      );
    }
    const { message, history } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    const aiBaseUrl = (process.env.AI_BASE_URL || "https://vyceai.com/v1").replace(/\/$/, "");
    const aiModel = process.env.AI_MODEL || "claude-sonnet-4-6";
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. If Custom AI / OpenAI-compatible API key is configured (VyceAI / DeepSeek / OpenAI)
    if (aiApiKey) {
      try {
        const formattedMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...(Array.isArray(history) ? history.slice(-6) : []).map((h: any) => ({
            role: h.role === "user" ? "user" : "assistant",
            content: String(h.content || ""),
          })),
          { role: "user", content: message },
        ];

        const response = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aiApiKey}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: JSON.stringify({
            model: aiModel,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 180,
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply && typeof reply === "string") {
            return NextResponse.json({ reply, source: `${aiModel}@vyceai` });
          }
        } else {
          console.warn("AI API non-200 response status:", response.status);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("AI API call failed, falling back to local engine:", errorMsg);
      }
    }

    // 2. If Gemini API key is configured
    if (geminiKey) {
      try {
        const contents = [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nPesan Pengguna: ${message}` }] }
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply, source: "gemini-api" });
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local engine:", err);
      }
    }

    // 3. Built-in Comprehensive Knowledge Engine
    const localReply = getLocalKnowledgeResponse(message);
    return NextResponse.json({
      reply: localReply,
      source: "naufal-knowledge-engine",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server chat AI." },
      { status: 500 }
    );
  }
}
