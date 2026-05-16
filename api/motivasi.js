const MAX_FIELD_LENGTH = 100;
const UPSTREAM_TIMEOUT_MS = 90000;
const MAX_TOKENS = 600;

function clip(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim();
  if (!s) return fallback;
  return s.slice(0, MAX_FIELD_LENGTH);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};

    // Validate required fields first (before clipping, so empty strings fail).
    if (!body.nama || !body.mood) {
      console.warn('[GoodDay API] Missing required fields:', { nama: !!body.nama, mood: !!body.mood });
      res.status(400).json({ error: 'nama dan mood diperlukan' });
      return;
    }

    const nama = clip(body.nama, 'Sahabat');
    const mood = clip(body.mood, 'tenang');
    const usia = clip(body.usia, 'dewasa');
    const gender = clip(body.gender, 'tidak disebutkan');
    const profesi = clip(body.profesi, 'pekerja');
    const waktu = clip(body.waktu, 'hari ini');

    const apiKey = process.env.SUMOPOD_API_KEY;
    if (!apiKey) {
      console.error('[GoodDay API] SUMOPOD_API_KEY tidak dikonfigurasi');
      res.status(500).json({ error: 'SUMOPOD_API_KEY tidak dikonfigurasi' });
      return;
    }

    const prompt = `Kamu adalah asisten spiritual Islami yang bijak dan hangat. Berikan pesan motivasi harian untuk ${nama} yang berusia ${usia} tahun, berprofesi sebagai ${profesi}, sedang merasakan ${mood}, pada waktu ${waktu}.

Pilih 1 ayat Al-Quran ATAU 1 Hadits shahih yang sangat relevan. Balas HANYA dengan JSON valid (tanpa markdown, tanpa code fence, tanpa kalimat pembuka). Skema:
{
  "arabic": "teks arab asli",
  "translation": "terjemahan Indonesia yang natural",
  "source": "sumber lengkap (QS Al-Baqarah: 286 atau HR Bukhari)",
  "type": "quran" atau "hadits",
  "narrative": "pesan motivasi personal 2-3 kalimat menyebut nama ${nama}"
}`;

    console.log('[GoodDay API] Request from', nama, '| mood:', mood, '| waktu:', waktu);

    // Upstream timeout — must fire before the frontend's 120s abort, so the user
    // gets a clean 504 instead of a generic "API tidak merespons" message.
    const upstreamController = new AbortController();
    const upstreamTimeoutId = setTimeout(() => upstreamController.abort(), UPSTREAM_TIMEOUT_MS);
    const startedAt = Date.now();

    let response;
    try {
      response = await fetch('https://ai.sumopod.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: MAX_TOKENS,
          messages: [
            { role: 'user', content: prompt },
            // Prefill the assistant turn with `{` so the model is forced to
            // start with a JSON object — eliminates "no JSON found" errors
            // caused by chatty preambles or ```json fences.
            { role: 'assistant', content: '{' }
          ]
        }),
        signal: upstreamController.signal
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        console.error(`[GoodDay API] Sumopod upstream timeout after ${UPSTREAM_TIMEOUT_MS / 1000}s`);
        res.status(504).json({ error: `Upstream API timeout: Sumopod tidak merespons dalam ${UPSTREAM_TIMEOUT_MS / 1000} detik` });
        return;
      }
      throw fetchErr;
    } finally {
      clearTimeout(upstreamTimeoutId);
    }

    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      const err = await response.text();
      console.error('[GoodDay API] Sumopod Error:', response.status, '| duration:', durationMs, 'ms | message:', err.substring(0, 200));
      res.status(response.status >= 500 ? 502 : response.status).json({
        error: `Upstream error ${response.status}: ${response.statusText || 'unknown'}`
      });
      return;
    }

    const result = await response.json();
    const rawText = result.content?.[0]?.text ?? '';

    if (!rawText) {
      console.error('[GoodDay API] Empty response from Claude API after', durationMs, 'ms');
      res.status(502).json({ error: 'Empty response from API' });
      return;
    }

    // Because we prefilled `{`, the model output continues from there.
    // Reconstruct full JSON and locate the matching closing brace so any
    // trailing tokens (rare) don't break parsing.
    const candidate = '{' + rawText;
    const jsonString = extractFirstJsonObject(candidate);
    if (!jsonString) {
      console.error('[GoodDay API] No balanced JSON found. Raw:', candidate.substring(0, 300));
      res.status(502).json({ error: 'Invalid response format: no JSON found' });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error('[GoodDay API] JSON parse error:', parseErr.message, '| candidate:', jsonString.substring(0, 200));
      res.status(502).json({ error: 'Invalid JSON in response: ' + parseErr.message });
      return;
    }

    const requiredFields = ['arabic', 'translation', 'source', 'narrative', 'type'];
    const missingFields = requiredFields.filter(field =>
      !parsed[field] || (typeof parsed[field] === 'string' && parsed[field].trim() === '')
    );

    if (missingFields.length > 0) {
      console.error('[GoodDay API] Missing fields:', missingFields, '| received:', JSON.stringify(parsed));
      res.status(502).json({ error: 'Invalid response structure: missing fields ' + missingFields.join(', ') });
      return;
    }

    // Normalize type — model sometimes returns "Quran" or "Hadits" capitalized.
    parsed.type = String(parsed.type).toLowerCase().trim();
    if (!['quran', 'hadits'].includes(parsed.type)) {
      console.error('[GoodDay API] Invalid type:', parsed.type);
      res.status(502).json({ error: 'Invalid type: must be "quran" or "hadits"' });
      return;
    }

    console.log('[GoodDay API] OK', nama, '| type:', parsed.type, '| source:', parsed.source, '| upstream:', durationMs, 'ms');
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json(parsed);

  } catch (error) {
    console.error('[GoodDay API] Unhandled error:', error.message);
    console.error('[GoodDay API] Stack:', error.stack);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
}

// Walk the string and return the first balanced {...} object, respecting
// string literals and escape sequences. Handles cases where the model adds
// trailing commentary after the JSON.
function extractFirstJsonObject(s) {
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start !== -1) return s.slice(start, i + 1);
    }
  }
  return null;
}
