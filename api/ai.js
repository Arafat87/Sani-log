/* SANI.LOG AI proxy — keeps the model key off the client.
   Env (Vercel → Project → Settings → Environment Variables):
     OPENAI_API_KEY    required for server-side calls (else client key is forwarded)
     OPENAI_BASE_URL   optional, OpenAI-compatible endpoint
     AI_SHARED_SECRET  optional — when set, requests must include the same secret
*/
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { kind = "chat", messages, model = "gpt-4o-mini", json = true,
          key = "", secret = "", prompt = "", size = "1792x1024" } = body || {};
  const need = process.env.AI_SHARED_SECRET || "";
  if (need && secret !== need) return res.status(403).json({ ok: false, error: "Bad proxy secret" });
  const useKey = process.env.OPENAI_API_KEY || key;
  if (!useKey) return res.status(200).json({ ok: false, error: "NO_KEY" });
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const headers = { "Content-Type": "application/json", Authorization: "Bearer " + useKey };
  try {
    if (kind === "image") {
      const r = await fetch(base + "/images/generations", { method: "POST", headers,
        body: JSON.stringify({ model: "dall-e-3", prompt, size, response_format: "b64_json" }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.data || !j.data[0]) throw new Error((j.error && j.error.message) || ("HTTP " + r.status));
      return res.status(200).json({ ok: true, data: j.data[0].b64_json });
    }
    const payload = { model, messages };
    if (json) payload.response_format = { type: "json_object" };
    const r = await fetch(base + "/chat/completions", { method: "POST", headers, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.choices || !j.choices[0]) throw new Error((j.error && j.error.message) || ("HTTP " + r.status));
    return res.status(200).json({ ok: true, data: j.choices[0].message.content });
  } catch (e) {
    return res.status(200).json({ ok: false, error: String((e && e.message) || e).slice(0, 300) });
  }
}
