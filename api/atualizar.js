// Função serverless do Vercel: /api/atualizar
// Mantém a ANTHROPIC_API_KEY no servidor (nunca exposta no navegador).
// Busca a tabela oficial da Copa 2026 e devolve { matches: [...] }.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada no Vercel." });
  }

  const prompt =
    "Busque na web a tabela oficial da Copa do Mundo FIFA 2026 (fase de grupos, junho de 2026). " +
    "Para cada jogo que encontrar, retorne data, horário de Brasília e placar final se já encerrado. " +
    "Responda APENAS com um array JSON, sem texto extra e sem markdown, no formato: " +
    '[{"home":"Brasil","away":"Haiti","date":"2026-06-19","time":"21:30","homeScore":null,"awayScore":null}]. ' +
    "Use nomes das seleções em português, time no formato 24h (horário de Brasília), e homeScore/awayScore " +
    "como número (ou null se o jogo ainda não terminou).";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const data = await r.json();
    if (data.error) {
      return res.status(502).json({ error: data.error.message || "Falha na API da Anthropic." });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");
    let matches = [];
    if (start !== -1 && end !== -1) {
      try { matches = JSON.parse(clean.slice(start, end + 1)); } catch { matches = []; }
    }
    return res.status(200).json({ matches });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
