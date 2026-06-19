// api/atualizar.js — Chalana's Bet
// Atualização automática de placares da Copa 2026.
// Fluxo: busca jogos ENCERRADOS na football-data.org -> casa com os jogos do app
//        -> grava realH/realA/finished na tabela kv do Supabase.
// O ranking do app recalcula sozinho a partir desses dados.
//
// Pode ser chamada de dois jeitos:
//   - POST  /api/atualizar        -> usado pelo botão "Atualizar via IA" (mesma origem)
//   - GET   /api/atualizar?key=…  -> usado pelo cron externo (cron-job.org)
//
// Variáveis de ambiente na Vercel (Settings -> Environment Variables):
//   FOOTBALL_DATA_TOKEN   (obrigatória)  token grátis de football-data.org
//   VITE_SUPABASE_URL     (já existe)
//   VITE_SUPABASE_ANON_KEY(já existe)
//   CRON_SECRET           (opcional)     senha simples pra proteger o GET do cron

const K_MATCHES = "chalanas:matches:v3";
const WC_URL = "https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED";

// ---- normalização ----
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

// PT (como está no app)  ->  apelidos aceitos da football-data (nome/abreviações/tla)
const TEAM_ALIASES = {
  "Brasil": ["brazil", "bra"],
  "Marrocos": ["morocco", "mar"],
  "Haiti": ["haiti", "hai"],
  "Escócia": ["scotland", "sco"],
  "México": ["mexico", "mex"],
  "África do Sul": ["south africa", "rsa", "saf"],
  "Coreia do Sul": ["south korea", "korea republic", "republic of korea", "kor"],
  "Dinamarca": ["denmark", "den"],
  "Canadá": ["canada", "can"],
  "Catar": ["qatar", "qat"],
  "Itália": ["italy", "ita"],
  "Estados Unidos": ["united states", "usa", "united states of america"],
  "Paraguai": ["paraguay", "par"],
  "Austrália": ["australia", "aus"],
  "Turquia": ["turkey", "turkiye", "türkiye", "tur"],
  "Suíça": ["switzerland", "sui", "swi"],
  "Bósnia e Herzegovina": ["bosnia and herzegovina", "bosnia herzegovina", "bosnia-herzegovina", "bih"],
  "Alemanha": ["germany", "ger", "deu"],
  "Curaçao": ["curacao", "cuw"],
  "Países Baixos": ["netherlands", "holland", "ned", "nld"],
  "Japão": ["japan", "jpn", "jap"],
  "Costa do Marfim": ["cote divoire", "cote d ivoire", "ivory coast", "civ"],
  "Equador": ["ecuador", "ecu"],
  "Tunísia": ["tunisia", "tun"],
  "Espanha": ["spain", "esp"],
  "Cabo Verde": ["cape verde", "cabo verde", "cpv"],
  "Uruguai": ["uruguay", "uru"],
  "Arábia Saudita": ["saudi arabia", "ksa", "sau"],
  "Bélgica": ["belgium", "bel"],
  "Irã": ["iran", "ir iran", "islamic republic of iran", "irn"],
  "Nova Zelândia": ["new zealand", "nzl"],
  "Egito": ["egypt", "egy"],
  "Suécia": ["sweden", "swe"],
  "Croácia": ["croatia", "cro"],
  "Argentina": ["argentina", "arg"],
  "França": ["france", "fra"],
  "Inglaterra": ["england", "eng"],
  "Portugal": ["portugal", "por"],
  "Colômbia": ["colombia", "col"],
  "Senegal": ["senegal", "sen"],
  "República Tcheca": ["czechia", "czech republic", "cze"],
  "Iraque": ["iraq", "irq"],
  "Noruega": ["norway", "nor"],
  "Áustria": ["austria", "aut"],
  "Jordânia": ["jordan", "jor"],
  "Argélia": ["algeria", "alg", "dza"],
  "Uzbequistão": ["uzbekistan", "uzb"],
  "Panamá": ["panama", "pan"],
  "Gana": ["ghana", "gha"],
  "RD Congo": ["dr congo", "congo dr", "democratic republic of congo", "cod", "congo"],
};

// índice  apelido-normalizado -> nome PT
const ALIAS_INDEX = {};
for (const [pt, aliases] of Object.entries(TEAM_ALIASES)) {
  ALIAS_INDEX[norm(pt)] = pt;
  for (const a of aliases) ALIAS_INDEX[norm(a)] = pt;
}

// dado um time da API, devolve o nome PT (ou null)
function toPt(apiTeam) {
  if (!apiTeam) return null;
  const cands = [apiTeam.name, apiTeam.shortName, apiTeam.tla].filter(Boolean);
  for (const c of cands) {
    const hit = ALIAS_INDEX[norm(c)];
    if (hit) return hit;
  }
  return null;
}

// ---- Supabase REST (sem dependências) ----
function sbHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}
async function sbGetMatches(url, key) {
  const r = await fetch(
    `${url}/rest/v1/kv?key=eq.${encodeURIComponent(K_MATCHES)}&select=value`,
    { headers: sbHeaders(key) }
  );
  if (!r.ok) throw new Error(`Supabase GET ${r.status}`);
  const rows = await r.json();
  if (!rows.length || rows[0].value == null) return [];
  try { return JSON.parse(rows[0].value); } catch { return []; }
}
async function sbSaveMatches(url, key, matches) {
  const body = JSON.stringify({
    key: K_MATCHES,
    value: JSON.stringify(matches),
    updated_at: new Date().toISOString(),
  });
  const r = await fetch(`${url}/rest/v1/kv?on_conflict=key`, {
    method: "POST",
    headers: { ...sbHeaders(key), Prefer: "resolution=merge-duplicates" },
    body,
  });
  if (!r.ok) throw new Error(`Supabase POST ${r.status}: ${await r.text()}`);
}

export default async function handler(req, res) {
  const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
  const SB_URL = process.env.VITE_SUPABASE_URL;
  const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  const SECRET = process.env.CRON_SECRET;

  // protege o GET do cron, se um segredo estiver configurado
  if (req.method === "GET" && SECRET) {
    const k = (req.query && req.query.key) || "";
    if (k !== SECRET) return res.status(401).json({ error: "não autorizado" });
  }

  if (!TOKEN) return res.status(500).json({ error: "FOOTBALL_DATA_TOKEN não configurado" });
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: "Supabase não configurado" });

  try {
    // 1) jogos encerrados oficiais
    const apiRes = await fetch(WC_URL, { headers: { "X-Auth-Token": TOKEN } });
    if (!apiRes.ok) {
      return res.status(502).json({ error: `football-data ${apiRes.status}` });
    }
    const apiData = await apiRes.json();
    const apiMatches = Array.isArray(apiData.matches) ? apiData.matches : [];

    // 2) jogos atuais do app
    const matches = await sbGetMatches(SB_URL, SB_KEY);

    // 3) casa por times e aplica o placar final
    let applied = 0;
    const retorno = []; // para o botão "Atualizar via IA"
    for (const am of apiMatches) {
      const ph = toPt(am.homeTeam);
      const pa = toPt(am.awayTeam);
      if (!ph || !pa) continue;
      const ft = am.score && am.score.fullTime;
      if (!ft || ft.home == null || ft.away == null) continue;

      const m = matches.find(
        (x) =>
          (x.home === ph && x.away === pa) || (x.home === pa && x.away === ph)
      );
      if (!m) continue;

      const swap = m.home === pa; // times invertidos em relação ao app
      const h = swap ? ft.away : ft.home;
      const a = swap ? ft.home : ft.away;

      if (m.realH !== h || m.realA !== a || !m.finished) {
        m.realH = h;
        m.realA = a;
        m.finished = true;
        applied++;
      }
      retorno.push({ home: m.home, away: m.away, homeScore: m.realH, awayScore: m.realA });
    }

    // 4) grava de volta (só se algo mudou)
    if (applied > 0) await sbSaveMatches(SB_URL, SB_KEY, matches);

    return res.status(200).json({
      ok: true,
      updated: applied,
      checked: apiMatches.length,
      matches: retorno, // compatível com o botão "Atualizar via IA"
    });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
