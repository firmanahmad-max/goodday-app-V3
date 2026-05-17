# CLAUDE.md

Panduan untuk Claude (atau AI assistant lain) yang bekerja di repo ini.

## Project Snapshot

**GoodDay** adalah PWA Islami yang memberikan motivasi harian dari Al-Qur'an/Hadits, dipersonalisasi via Claude Haiku 4.5 (melalui proxy Sumopod). Frontend statis di GitHub Pages, backend Node.js di Railway.

- **Frontend:** `docs/index.html` — single-file PWA (HTML + inline CSS + inline JS)
- **Backend:** `server.js` + `api/motivasi.js` — minimal Node `http` server
- **PWA assets:** `docs/manifest.json`, `docs/sw.js`
- **Storage:** browser `localStorage` only — tidak ada DB

## Deployment Topology

Penting — repo ini punya dua "remote roles":

- **Production / canonical:** `firmanahmad-max/goodday-app-V3` (deployed ke GitHub Pages + Railway)
- **Contributor fork:** `mshadianto/goodday-app-V3`

Workflow standar dari fork `mshadianto`:

```bash
git push origin main
gh pr create --repo firmanahmad-max/goodday-app-V3 --head mshadianto:main --base main ...
```

Firman me-review & merge dari sisi production. **Jangan** push langsung ke `firmanahmad-max` — selalu via PR.

## Architecture Quick Facts

- **No build step.** Edit HTML/CSS/JS lalu commit. GitHub Pages auto-deploy dari `/docs`.
- **API endpoint:** `https://goodday-app-v3-production.up.railway.app/api/motivasi`
- **API key:** `SUMOPOD_API_KEY` env var di Railway (jangan pernah commit)
- **Model:** `claude-haiku-4-5` via `https://ai.sumopod.com/v1/messages` (Anthropic-compatible API)
- **JSON prefill trick:** Backend mem-prefill `{` di assistant turn supaya model tidak bisa keluarin markdown fence atau preamble. Reconstruct dengan `'{' + rawText` lalu parse via `extractFirstJsonObject()` (balanced-brace walker, bukan regex — handle string literals & escapes).
- **Upstream timeout (90s) harus < frontend timeout (120s).** Kalau dibalik, user kena generic "API tidak merespons" alih-alih 504 yang informatif.

## File Layout

```
goodday-app-V3/
├── docs/                       ← Frontend (served by GitHub Pages)
│   ├── index.html              ← Single-file app: HTML + <style> + <script>
│   ├── manifest.json
│   └── sw.js                   ← Service worker (offline cache)
├── api/
│   └── motivasi.js             ← Vercel-style handler: (req, res) => {...}
├── server.js                   ← Wraps handler in Node http server for Railway
├── package.json                ← type: "module", node-fetch only
├── README.md
├── ROADMAP.md                  ← V4 ideas (notifications, dark mode, i18n, dll)
└── CLAUDE.md                   ← This file
```

## Code Conventions

- **Single-file frontend.** Jangan split jadi multi-file kecuali ada alasan kuat — bagian dari nilai jualnya: "no build, no bundler, no framework."
- **Variable naming di JS frontend dipendekkan** (`mc`, `gbar`, `mrow`, `mchip`) — bukan style yang biasanya direkomendasikan, tapi pertahankan konsistensinya karena file ini di-inline ke HTML dan ukuran matters.
- **CSS dipendekkan juga** (`.mchip`, `.qbadge`, dll). Ikuti pola yang ada.
- **Default to no comments.** Tambahkan comment hanya kalau *why* non-obvious (mis. JSON prefill trick di `api/motivasi.js`).
- **Tidak ada framework.** Vanilla JS. Tidak boleh tambah React/Vue/jQuery di v3. V4 boleh — lihat ROADMAP.
- **Bahasa user-facing: Indonesia.** Bahasa code/log/error message: English.

## Common Pitfalls

- **Toggle elements pakai `<input type="checkbox">`** — cek `.checked`, **bukan** `.classList.contains('on')`. Pernah ada bug Arab tidak tampil karena ini.
- **Mood tidak boleh auto-default** — user harus pilih dulu, baru fetch motivasi (UX decision, jangan dibalik).
- **CORS:** `server.js` whitelist `firmanahmad-max.github.io` + localhost. Kalau testing dari domain lain, akan fallback ke `*`.
- **Sumopod kadang slow (≤ 90s).** Jangan kecilkan timeout tanpa diskusi.
- **`docs/sw.js` cache aggressive.** Setelah deploy, user perlu hard-refresh untuk lihat perubahan. Pertimbangkan bump cache version kalau ada perubahan besar.

## Testing

Tidak ada test suite. Verifikasi manual:

1. Buka `docs/index.html` via `npx http-server docs`
2. Test golden path: onboarding → pick mood → motivasi muncul
3. Toggle Arab on/off di Setelan → cek tampilan
4. Test offline (DevTools → Network → Offline) → cek PWA shell tetap load
5. Mobile viewport (DevTools responsive mode) — utama, karena ini mobile-first

## Git & PR Conventions

- Commit message: gaya `fix:` / `feat:` / `chore:` di subject line, lowercase
- Body wrap di ~72 chars
- Selalu sertakan trailer `Co-Authored-By: Claude ...` saat di-generate AI
- PR title mirror commit subject (singkat, ≤ 70 chars)
- PR body: `## Summary` + `## Test plan` (checklist)

## What NOT to Do

- ❌ Push langsung ke `firmanahmad-max` (selalu via PR dari fork)
- ❌ Commit `SUMOPOD_API_KEY` atau secret lain
- ❌ Tambah dependency baru tanpa alasan kuat (saat ini cuma `node-fetch`)
- ❌ Refactor besar tanpa diskusi — repo ini sengaja minimal
- ❌ Ganti model AI tanpa test (Haiku 4.5 sudah di-tune untuk prompt yang ada)
- ❌ Hapus `data-default` styling tanpa cek apakah masih dipakai
