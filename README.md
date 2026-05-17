<div align="center">

# ✨ GoodDay

### *Islamic Daily Self Affirmation*

**Mulai harimu bukan dengan ramalan — tapi dengan ayat & hadits.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Open_App-c9a96e?style=for-the-badge)](https://firmanahmad-max.github.io/goodday-app-V3/)
[![Version](https://img.shields.io/badge/version-3.0-1a0a2e?style=for-the-badge)](./ROADMAP.md)
[![License](https://img.shields.io/badge/license-MIT-2d1b5e?style=for-the-badge)](#-license)
[![PWA](https://img.shields.io/badge/PWA-Ready-4a1878?style=for-the-badge&logo=pwa&logoColor=white)](#-pwa-install)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](#)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=white)](#)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222?logo=github&logoColor=white)](#)

</div>

---

## 💭 Cerita di Balik GoodDay

> *"Dalam banyak drama Korea, orang memulai harinya dengan membaca ramalan zodiak atau shio sebagai afirmasi. Pertanyaannya sederhana: sebagai Muslim, mengapa kita tidak memulai hari dengan sumber afirmasi yang jauh lebih bermakna — ayat Al-Qur'an dan hadits?"*

GoodDay adalah **PWA Islami** yang menghadirkan motivasi harian dari Al-Qur'an dan Hadits, **dipersonalisasi** berdasarkan nama, usia, profesi, mood, dan waktu (Subuh / Pagi / Siang / Malam).

---

## 🎨 Sneak Peek

```
   ╔══════════════════════════════════════╗
   ║   🌅  Pagi, Firmana 👋               ║
   ╠══════════════════════════════════════╣
   ║   Bagaimana moodmu hari ini?        ║
   ║   [😌 bersemangat]  [🥰 berbahagia]  ║
   ║   [😇 tenang]       [😢 sedih] …     ║
   ╠══════════════════════════════════════╣
   ║   📖 Al-Quran                        ║
   ║                                      ║
   ║   فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا              ║
   ║   "Sesungguhnya bersama kesulitan   ║
   ║    ada kemudahan."                   ║
   ║   — QS Al-Insyirah: 6                ║
   ╚══════════════════════════════════════╝
```

---

## ✨ Fitur Utama

| | |
|---|---|
| 🧠 **Personal** | Motivasi disesuaikan dengan nama, usia, profesi, mood, dan waktu hari |
| 🕰️ **Time-Aware** | Tema dan greeting berubah otomatis: Subuh, Pagi, Siang, Malam |
| 🎭 **15 Mood** | Dari `bersemangat`, `bersyukur`, `tenang` sampai `lelah`, `rindu`, `hampa` |
| 📖 **Al-Qur'an & Hadits** | Sumber asli + terjemahan + teks Arab (toggleable) |
| 💾 **Offline-First** | PWA + Service Worker; tetap jalan tanpa koneksi |
| 🔒 **Privacy-First** | Semua data user di `localStorage` — **tidak ada tracking** |
| 📱 **Mobile-First** | Responsive, installable ke home screen (Android & iOS) |
| 📚 **Riwayat** | 50 motivasi terakhir tersimpan otomatis di device |

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICE                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PWA (docs/index.html)                            │  │
│  │  • Onboarding · Mood picker · History · Settings  │  │
│  │  • localStorage (user, history, msg count)        │  │
│  └────────────────────┬──────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │ HTTPS POST /api/motivasi
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  RAILWAY BACKEND                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  server.js → api/motivasi.js                      │  │
│  │  • Input validation & CORS                        │  │
│  │  • Prompt construction (personalized)             │  │
│  │  • Upstream timeout guard (90s)                   │  │
│  │  • Robust JSON extraction                         │  │
│  └────────────────────┬──────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │ Claude API via Sumopod proxy
                        ▼
                ┌──────────────────┐
                │  Claude Haiku    │
                │  4.5 (Sumopod)   │
                └──────────────────┘
```

**Frontend:** GitHub Pages · static HTML/CSS/JS, no build step
**Backend:** Railway · Node.js + plain `http` server
**Model:** `claude-haiku-4-5` via Sumopod (Anthropic-compatible)
**Storage:** `localStorage` (client-side only — no server DB)

---

## 🚀 Quick Start

### 1. Clone & Run Frontend Locally

```bash
git clone https://github.com/firmanahmad-max/goodday-app-V3.git
cd goodday-app-V3

npx http-server docs
# → http://localhost:8080
```

### 2. Run Backend Locally

```bash
npm install
SUMOPOD_API_KEY=sk-xxxxx npm start
# → http://localhost:3000/api/motivasi
```

Update `docs/index.html` baris `API_URL` ke `http://localhost:3000/api/motivasi` untuk testing lokal.

### 3. Deploy

**Frontend (GitHub Pages):**
Settings → Pages → Source: `main` branch, `/docs` folder

**Backend (Railway):**
New Project → Deploy from GitHub → set env `SUMOPOD_API_KEY`

---

## 🧪 Tech Stack

<div align="center">

| Layer | Tech |
|---|---|
| **Frontend** | Vanilla HTML5 · CSS3 · ES6+ JavaScript |
| **PWA** | Web App Manifest · Service Worker |
| **Backend** | Node.js · Native `http` module · ESM |
| **AI Model** | Claude Haiku 4.5 (via Sumopod proxy) |
| **Hosting** | GitHub Pages (frontend) · Railway (backend) |
| **Storage** | Browser localStorage |
| **Fonts** | Playfair Display · DM Sans · Amiri (Arabic) |

</div>

---

## 📱 PWA Install

| Platform | Cara Install |
|---|---|
| **Android** | Chrome → ⋮ menu → *"Install app"* atau *"Tambahkan ke layar utama"* |
| **iOS** | Safari → Share → *"Add to Home Screen"* |
| **Desktop** | Chrome/Edge → ikon install di address bar |

---

## 🔐 Privacy

- ✅ Semua data user disimpan **lokal** di device (`localStorage`)
- ✅ **Zero tracking**, no analytics, no cookies
- ✅ Backend **hanya** menerima nama/usia/mood/waktu untuk request — tidak disimpan
- ✅ API key Sumopod tersimpan sebagai env variable di server, tidak pernah dikirim ke client

---

## 🛣️ Roadmap

Lihat [**ROADMAP.md**](./ROADMAP.md) untuk rencana **V4** dan seterusnya:

- 🔔 Daily notifications
- 🌙 Dark mode toggle
- 🌐 i18n (English, Arabic)
- 📤 Share to social media
- ⭐ Favorite quotes
- 📅 Calendar view
- 📊 Mood patterns dashboard
- 🤖 AI customization based on history

---

## 🤝 Contributing

Kontribusi sangat welcome! Workflow standar:

1. **Fork** repo ini
2. **Branch** dari `main` (`git checkout -b feat/fitur-keren`)
3. **Commit** dengan pesan yang jelas
4. **Push** ke fork-mu
5. **Pull Request** ke `firmanahmad-max/goodday-app-V3:main`

Sebelum buka PR, pastikan:
- Test manual di mobile viewport (Chrome DevTools)
- Tidak ada API key ter-commit
- Tidak ada `console.log` berlebih yang tertinggal

---

## 👥 Tim Developer

<div align="center">

| | |
|:---:|:---:|
| **Firman Ahmad** | **MS Hadianto** |
| [@boysnocry](https://github.com/firmanahmad-max) | [@mshadianto](https://github.com/mshadianto) |
| *Founder · Vision · Backend* | *Frontend · UX · DevOps* |

</div>

---

## 📄 License

MIT License © 2026 — Firman Ahmad & MS Hadianto

Bebas digunakan, dimodifikasi, dan disebarluaskan. Atribusi sangat dihargai 🙏

---

<div align="center">

### Made with ❤️ for the Ummah

*"Sesungguhnya bersama kesulitan ada kemudahan."* — **QS Al-Insyirah: 6**

[⬆ Back to top](#-goodday)

</div>
