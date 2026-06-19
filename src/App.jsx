import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Trophy, Lock, Shield, Users, RefreshCw, Settings, Plus, Check, ChevronDown, Calendar, Flame, X, LogOut } from "lucide-react";
import { sGet, sSet, sList } from "./supabase";

/* =========================================================================
   CHALANA'S BET — Bolão Copa do Mundo 2026
   ========================================================================= */

const TEAMS = {
  "Brasil":"🇧🇷","Marrocos":"🇲🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","México":"🇲🇽",
  "África do Sul":"🇿🇦","Coreia do Sul":"🇰🇷","Dinamarca":"🇩🇰","Canadá":"🇨🇦","Catar":"🇶🇦",
  "Itália":"🇮🇹","Estados Unidos":"🇺🇸","Paraguai":"🇵🇾","Austrália":"🇦🇺","Turquia":"🇹🇷",
  "Suíça":"🇨🇭","Bósnia e Herzegovina":"🇧🇦","Alemanha":"🇩🇪","Curaçao":"🇨🇼","Países Baixos":"🇳🇱",
  "Japão":"🇯🇵","Costa do Marfim":"🇨🇮","Equador":"🇪🇨","Tunísia":"🇹🇳","Espanha":"🇪🇸",
  "Cabo Verde":"🇨🇻","Uruguai":"🇺🇾","Arábia Saudita":"🇸🇦","Bélgica":"🇧🇪","Irã":"🇮🇷",
  "Nova Zelândia":"🇳🇿","Egito":"🇪🇬","Suécia":"🇸🇪","Croácia":"🇭🇷","Argentina":"🇦🇷",
  "França":"🇫🇷","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Colômbia":"🇨🇴","Senegal":"🇸🇳",
  "República Tcheca":"🇨🇿","Iraque":"🇮🇶","Noruega":"🇳🇴","Áustria":"🇦🇹","Jordânia":"🇯🇴",
  "Argélia":"🇩🇿","Uzbequistão":"🇺🇿","Panamá":"🇵🇦","Gana":"🇬🇭","RD Congo":"🇨🇩",
};
const flag = (t) => TEAMS[t] || "⚽";
const FAV_TEAMS = Object.keys(TEAMS).sort((a,b)=>a.localeCompare(b,"pt"));

// kickoff em horário de Brasília (-03:00). Grade oficial FIFA da fase de grupos (2ª e 3ª rodadas).
const iso = (d,t)=>`${d}T${t}:00-03:00`;
const SEED_MATCHES = [
  // ===== 2ª RODADA =====
  // 18/06 (qui) — jogos de hoje travam 2h antes; os dois primeiros já encerraram
  { id:"m-tch-afs", rodada:"2ª rodada", date:"2026-06-18", time:"13:00", home:"República Tcheca", away:"África do Sul", lockMin:120, realH:1, realA:1, finished:true },
  { id:"m-sui-bos", rodada:"2ª rodada", date:"2026-06-18", time:"16:00", home:"Suíça", away:"Bósnia e Herzegovina", lockMin:120, realH:4, realA:1, finished:true },
  { id:"m-can-cat", rodada:"2ª rodada", date:"2026-06-18", time:"19:00", home:"Canadá", away:"Catar", lockMin:120, realH:null, realA:null, finished:false },
  { id:"m-mex-cor", rodada:"2ª rodada", date:"2026-06-18", time:"22:00", home:"México", away:"Coreia do Sul", lockMin:120, realH:null, realA:null, finished:false },
  // 19/06 (sex)
  { id:"m-tur-par", rodada:"2ª rodada", date:"2026-06-20", time:"01:00", home:"Turquia", away:"Paraguai", realH:null, realA:null, finished:false },
  { id:"m-eua-aus", rodada:"2ª rodada", date:"2026-06-19", time:"16:00", home:"Estados Unidos", away:"Austrália", realH:null, realA:null, finished:false },
  { id:"m-esc-mar", rodada:"2ª rodada", date:"2026-06-19", time:"19:00", home:"Escócia", away:"Marrocos", realH:null, realA:null, finished:false },
  { id:"m-bra-hai", rodada:"2ª rodada", date:"2026-06-19", time:"21:30", home:"Brasil", away:"Haiti", realH:null, realA:null, finished:false },
  // 20/06 (sáb)
  { id:"m-pbx-sue", rodada:"2ª rodada", date:"2026-06-20", time:"14:00", home:"Países Baixos", away:"Suécia", realH:null, realA:null, finished:false },
  { id:"m-ale-cdm", rodada:"2ª rodada", date:"2026-06-20", time:"17:00", home:"Alemanha", away:"Costa do Marfim", realH:null, realA:null, finished:false },
  { id:"m-equ-cur", rodada:"2ª rodada", date:"2026-06-20", time:"21:00", home:"Equador", away:"Curaçao", realH:null, realA:null, finished:false },
  // 21/06 (dom)
  { id:"m-tun-jap", rodada:"2ª rodada", date:"2026-06-21", time:"01:00", home:"Tunísia", away:"Japão", realH:null, realA:null, finished:false },
  { id:"m-esp-ara", rodada:"2ª rodada", date:"2026-06-21", time:"13:00", home:"Espanha", away:"Arábia Saudita", realH:null, realA:null, finished:false },
  { id:"m-bel-ira", rodada:"2ª rodada", date:"2026-06-21", time:"16:00", home:"Bélgica", away:"Irã", realH:null, realA:null, finished:false },
  { id:"m-uru-cab", rodada:"2ª rodada", date:"2026-06-21", time:"19:00", home:"Uruguai", away:"Cabo Verde", realH:null, realA:null, finished:false },
  { id:"m-nz-egi",  rodada:"2ª rodada", date:"2026-06-21", time:"22:00", home:"Nova Zelândia", away:"Egito", realH:null, realA:null, finished:false },
  // 22/06 (seg)
  { id:"m-arg-aut", rodada:"2ª rodada", date:"2026-06-22", time:"14:00", home:"Argentina", away:"Áustria", realH:null, realA:null, finished:false },
  { id:"m-fra-irq", rodada:"2ª rodada", date:"2026-06-22", time:"18:00", home:"França", away:"Iraque", realH:null, realA:null, finished:false },
  { id:"m-nor-sen", rodada:"2ª rodada", date:"2026-06-22", time:"21:00", home:"Noruega", away:"Senegal", realH:null, realA:null, finished:false },
  // 23/06 (ter)
  { id:"m-jor-arl", rodada:"2ª rodada", date:"2026-06-23", time:"00:00", home:"Jordânia", away:"Argélia", realH:null, realA:null, finished:false },
  { id:"m-por-uzb", rodada:"2ª rodada", date:"2026-06-23", time:"14:00", home:"Portugal", away:"Uzbequistão", realH:null, realA:null, finished:false },
  { id:"m-ing-gan", rodada:"2ª rodada", date:"2026-06-23", time:"17:00", home:"Inglaterra", away:"Gana", realH:null, realA:null, finished:false },
  { id:"m-pan-cro", rodada:"2ª rodada", date:"2026-06-23", time:"20:00", home:"Panamá", away:"Croácia", realH:null, realA:null, finished:false },
  { id:"m-col-cod", rodada:"2ª rodada", date:"2026-06-23", time:"23:00", home:"Colômbia", away:"RD Congo", realH:null, realA:null, finished:false },

  // ===== 3ª RODADA =====
  // 24/06 (qua)
  { id:"m3-sui-can", rodada:"3ª rodada", date:"2026-06-24", time:"16:00", home:"Suíça", away:"Canadá", realH:null, realA:null, finished:false },
  { id:"m3-bos-cat", rodada:"3ª rodada", date:"2026-06-24", time:"16:00", home:"Bósnia e Herzegovina", away:"Catar", realH:null, realA:null, finished:false },
  { id:"m3-esc-bra", rodada:"3ª rodada", date:"2026-06-24", time:"19:00", home:"Escócia", away:"Brasil", realH:null, realA:null, finished:false },
  { id:"m3-mar-hai", rodada:"3ª rodada", date:"2026-06-24", time:"19:00", home:"Marrocos", away:"Haiti", realH:null, realA:null, finished:false },
  { id:"m3-tch-mex", rodada:"3ª rodada", date:"2026-06-24", time:"22:00", home:"República Tcheca", away:"México", realH:null, realA:null, finished:false },
  { id:"m3-afs-cor", rodada:"3ª rodada", date:"2026-06-24", time:"22:00", home:"África do Sul", away:"Coreia do Sul", realH:null, realA:null, finished:false },
  // 25/06 (qui)
  { id:"m3-equ-ale", rodada:"3ª rodada", date:"2026-06-25", time:"17:00", home:"Equador", away:"Alemanha", realH:null, realA:null, finished:false },
  { id:"m3-cur-cdm", rodada:"3ª rodada", date:"2026-06-25", time:"17:00", home:"Curaçao", away:"Costa do Marfim", realH:null, realA:null, finished:false },
  { id:"m3-jap-sue", rodada:"3ª rodada", date:"2026-06-25", time:"20:00", home:"Japão", away:"Suécia", realH:null, realA:null, finished:false },
  { id:"m3-tun-pbx", rodada:"3ª rodada", date:"2026-06-25", time:"20:00", home:"Tunísia", away:"Países Baixos", realH:null, realA:null, finished:false },
  { id:"m3-tur-eua", rodada:"3ª rodada", date:"2026-06-25", time:"23:00", home:"Turquia", away:"Estados Unidos", realH:null, realA:null, finished:false },
  { id:"m3-par-aus", rodada:"3ª rodada", date:"2026-06-25", time:"23:00", home:"Paraguai", away:"Austrália", realH:null, realA:null, finished:false },
  // 26/06 (sex)
  { id:"m3-nor-fra", rodada:"3ª rodada", date:"2026-06-26", time:"16:00", home:"Noruega", away:"França", realH:null, realA:null, finished:false },
  { id:"m3-sen-irq", rodada:"3ª rodada", date:"2026-06-26", time:"16:00", home:"Senegal", away:"Iraque", realH:null, realA:null, finished:false },
  { id:"m3-cab-ara", rodada:"3ª rodada", date:"2026-06-26", time:"21:00", home:"Cabo Verde", away:"Arábia Saudita", realH:null, realA:null, finished:false },
  { id:"m3-uru-esp", rodada:"3ª rodada", date:"2026-06-26", time:"21:00", home:"Uruguai", away:"Espanha", realH:null, realA:null, finished:false },
  // 27/06 (sáb)
  { id:"m3-egi-ira", rodada:"3ª rodada", date:"2026-06-27", time:"00:00", home:"Egito", away:"Irã", realH:null, realA:null, finished:false },
  { id:"m3-nz-bel",  rodada:"3ª rodada", date:"2026-06-27", time:"00:00", home:"Nova Zelândia", away:"Bélgica", realH:null, realA:null, finished:false },
  { id:"m3-pan-ing", rodada:"3ª rodada", date:"2026-06-27", time:"18:00", home:"Panamá", away:"Inglaterra", realH:null, realA:null, finished:false },
  { id:"m3-cro-gan", rodada:"3ª rodada", date:"2026-06-27", time:"18:00", home:"Croácia", away:"Gana", realH:null, realA:null, finished:false },
  { id:"m3-col-por", rodada:"3ª rodada", date:"2026-06-27", time:"20:30", home:"Colômbia", away:"Portugal", realH:null, realA:null, finished:false },
  { id:"m3-cod-uzb", rodada:"3ª rodada", date:"2026-06-27", time:"20:30", home:"RD Congo", away:"Uzbequistão", realH:null, realA:null, finished:false },
  { id:"m3-arl-aut", rodada:"3ª rodada", date:"2026-06-27", time:"23:00", home:"Argélia", away:"Áustria", realH:null, realA:null, finished:false },
  { id:"m3-jor-arg", rodada:"3ª rodada", date:"2026-06-27", time:"23:00", home:"Jordânia", away:"Argentina", realH:null, realA:null, finished:false },
];
const ADMIN_PIN = "chalana26";

// Apostadores pré-cadastrados (tabela enviada). O badge "VOCÊ" aparece para quem estiver logado.
// base = pontuação acumulada até Suíça × Bósnia (saldo inicial). seedRank = ordem de desempate da tabela.
const SEED_PLAYERS = [
  { id:"sp-01", name:"Brunodopivo",     favTeam:"Espanha",   base:0,    seedRank:12, createdAt:1 },
  { id:"sp-02", name:"dinOpehL.",       favTeam:"Brasil",    base:37,   seedRank:11, createdAt:2 },
  { id:"sp-03", name:"Wesley monteiro", favTeam:"França",    base:49,   seedRank:5,  createdAt:3 },
  { id:"sp-04", name:"Duda Pehl",       favTeam:"Brasil",    base:57,   seedRank:2,  createdAt:4 },
  { id:"sp-05", name:"M. Dias",         favTeam:"Espanha",   base:46,   seedRank:9,  createdAt:5 },
  { id:"sp-06", name:"KS",              favTeam:"Espanha",   base:48,   seedRank:7,  createdAt:6 },
  { id:"sp-07", name:"Diego Paz",       favTeam:"Alemanha",  base:49.5, seedRank:6,  createdAt:7 },
  { id:"sp-08", name:"Tiarles",         favTeam:"Brasil",    base:52,   seedRank:4,  createdAt:8 },
  { id:"sp-09", name:"Vítor",           favTeam:"França",    base:45.5, seedRank:10, createdAt:9 },
  { id:"sp-10", name:"Tião",            favTeam:"Brasil",    base:57,   seedRank:1,  createdAt:10 },
  { id:"sp-11", name:"Marcola",         favTeam:"Portugal",  base:47,   seedRank:8,  createdAt:11 },
  { id:"sp-12", name:"Gui",             favTeam:"Argentina", base:53.5, seedRank:3,  createdAt:12 },
];

// Palpites oficiais já lançados (Canadá × Catar — m-can-cat). h = gols do Canadá, a = gols do Catar.
const SEED_BETS = {
  "sp-02": { "m-can-cat":{h:1,a:0} }, // dinOpehL.
  "sp-03": { "m-can-cat":{h:2,a:1} }, // Wesley monteiro
  "sp-04": { "m-can-cat":{h:2,a:0} }, // Duda Pehl
  "sp-05": { "m-can-cat":{h:2,a:0} }, // M. Dias
  "sp-06": { "m-can-cat":{h:2,a:0} }, // KS
  "sp-07": { "m-can-cat":{h:2,a:1} }, // Diego Paz
  "sp-08": { "m-can-cat":{h:2,a:1} }, // Tiarles
  "sp-09": { "m-can-cat":{h:2,a:1} }, // Vítor
  "sp-11": { "m-can-cat":{h:2,a:0} }, // Marcola
  "sp-12": { "m-can-cat":{h:2,a:0} }, // Gui
};

// sobe quando o seed muda; dispara migração da base nos jogadores já cadastrados
const SEED_VERSION = 3;

/* ---------- armazenamento ----------
   sGet/sSet/sList vêm de ./supabase:
   - shared=true  -> tabela "kv" no Supabase (todos os amigos compartilham)
   - shared=false -> localStorage (por dispositivo: quem você é neste aparelho) */
const getJSON = async (k, s=true, def=null)=>{ const v=await sGet(k,s); if(v==null) return def; try{return JSON.parse(v);}catch{return def;} };
const setJSON = (k,v,s=true)=> sSet(k, JSON.stringify(v), s);

const K_MATCHES = "chalanas:matches:v3";
const K_PLAYERS = "chalanas:players:v1";
const K_BET = (pid)=>`chalanas:bet:${pid}`;
const K_SETTINGS = "chalanas:settings:v1";
const K_SEEDVER = "chalanas:seedver";
const K_ME = "chalanas:me:v1"; // pessoal (por dispositivo)

/* ---------- utilidades ---------- */
const norm = (s)=> (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g,"").trim();
const ALIAS = { "holanda":"paises baixos","eua":"estados unidos","usa":"estados unidos","czechia":"republica tcheca","south korea":"coreia do sul","fmt":"" };
const teamKey = (t)=>{ let n=norm(t); return ALIAS[n]||n; };
const kickoffMs = (m)=> new Date(iso(m.date,m.time)).getTime();
const fmtPts = (n)=>{ const v=Math.round(n*10)/10; return (v%1===0? String(v): v.toFixed(1)).replace(".",","); };
const WD = ["dom","seg","ter","qua","qui","sex","sáb"];
function dateLabel(d){ const dt=new Date(d+"T12:00:00-03:00"); return `${WD[dt.getDay()]} · ${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}`; }
const ROUND_ORDER = (r)=>{ const map={"1ª rodada":1,"2ª rodada":2,"3ª rodada":3}; return map[r] ?? 99; };

/* ---------- motor de pontuação ----------
   5  placar exato (empate exato também = 5)
   3  acertou o vencedor  (+1 se também acertar um placar parcial → 4)
   2  apostou empate e deu empate com placar diferente
   1  placar parcial (acertou um dos lados) — vale inclusive quando o resultado é empate
   +0,5 favorito venceu | −0,5 favorito perdeu | empate do favorito não soma nem tira */
function scoreMatch(bet, m, favTeam){
  let pts = 0; const reasons = [];
  if(!m.finished || m.realH==null || m.realA==null) return { pts:0, reasons, scored:false };
  const rh=m.realH, ra=m.realA;
  if(bet && bet.h!=null && bet.a!=null){
    const ph=bet.h, pa=bet.a;
    const exact = ph===rh && pa===ra;
    const realDraw = rh===ra, betDraw = ph===pa;
    const partial = (ph===rh) || (pa===ra);
    if(exact){
      pts = 5; reasons.push("Placar exato (+5)");
    } else if(realDraw){
      if(betDraw){ pts = 2; reasons.push("Acertou o empate (+2)"); }
      else if(partial){ pts = 1; reasons.push("Acertou um placar parcial (+1)"); }
    } else { // resultado com vencedor
      const correctWinner = !betDraw && ((ph>pa)===(rh>ra));
      if(correctWinner){
        pts = 3; reasons.push("Acertou o vencedor (+3)");
        if(partial){ pts += 1; reasons.push("Acertou um placar parcial (+1)"); }
      } else if(partial){
        pts = 1; reasons.push("Acertou um placar parcial (+1)");
      }
    }
  }
  if(favTeam && (m.home===favTeam || m.away===favTeam)){
    const favHome = m.home===favTeam;
    const favWon = favHome ? rh>ra : ra>rh;
    const favLost = favHome ? rh<ra : ra<rh;
    if(favWon){ pts+=0.5; reasons.push("Favorito venceu (+0,5)"); }
    else if(favLost){ pts-=0.5; reasons.push("Favorito perdeu (−0,5)"); }
  }
  return { pts, reasons, scored: reasons.length>0 };
}

/* ===================================================================== */
export default function ChalanasBet(){
  const [loaded,setLoaded] = useState(false);
  const [matches,setMatches] = useState([]);
  const [players,setPlayers] = useState([]);
  const [bets,setBets] = useState({});           // { pid: { matchId:{h,a} } }
  const [settings,setSettings] = useState({ revealBeforeLock:false });
  const [meId,setMeId] = useState(null);
  const [tab,setTab] = useState("jogos");
  const [now,setNow] = useState(Date.now());
  const [toast,setToast] = useState(null);
  const toastT = useRef(null);

  const showToast = useCallback((msg)=>{ setToast(msg); clearTimeout(toastT.current); toastT.current=setTimeout(()=>setToast(null),2600); },[]);

  const refresh = useCallback(async ()=>{
    const ms = await getJSON(K_MATCHES,true,SEED_MATCHES) || SEED_MATCHES;
    const ps = await getJSON(K_PLAYERS,true,[]) || [];
    const st = await getJSON(K_SETTINGS,true,{revealBeforeLock:false}) || {revealBeforeLock:false};
    const bmap = {};
    for(const p of ps){ bmap[p.id] = await getJSON(K_BET(p.id),true,{}) || {}; }
    setMatches(ms); setPlayers(ps); setSettings(st); setBets(bmap);
  },[]);

  // roda uma vez: garante tabela, trava de 2h em 18/06 e cadastro dos apostadores
  const ensureSeed = useCallback(async ()=>{
    let ms = await getJSON(K_MATCHES,true,null);
    let changed = !ms;
    if(!ms) ms = SEED_MATCHES.slice();
    ms = ms.map(m=>{ if(m.date==="2026-06-18" && m.lockMin==null){ changed=true; return {...m, lockMin:120}; } return m; });
    if(changed) await setJSON(K_MATCHES, ms, true);

    let ps = await getJSON(K_PLAYERS,true,null);
    if(!ps){ await setJSON(K_PLAYERS, SEED_PLAYERS.slice(), true); }
    else {
      const have = new Set(ps.map(p=>norm(p.name)));
      let added = false;
      for(const sp of SEED_PLAYERS){ if(!have.has(norm(sp.name))){ ps.push({...sp}); added=true; } }
      if(added) await setJSON(K_PLAYERS, ps, true);
    }

    // migração: aplica a pontuação-base e a ordem de desempate aos jogadores já cadastrados
    const ver = await sGet(K_SEEDVER, true);
    if(ver !== String(SEED_VERSION)){
      let cur = await getJSON(K_PLAYERS,true,[]) || [];
      cur = cur.map(p=>{
        const sp = SEED_PLAYERS.find(s=> s.id===p.id) || SEED_PLAYERS.find(s=> norm(s.name)===norm(p.name));
        return sp ? { ...p, base: sp.base, seedRank: sp.seedRank } : p;
      });
      await setJSON(K_PLAYERS, cur, true);
      await sSet(K_SEEDVER, String(SEED_VERSION), true);
    }

    // palpites oficiais já lançados (não sobrescreve palpite que o jogador já tenha feito)
    for(const [pid, mb] of Object.entries(SEED_BETS)){
      const cur = await getJSON(K_BET(pid),true,{}) || {};
      let add = false;
      for(const [mid, sc] of Object.entries(mb)){ if(!cur[mid]){ cur[mid] = sc; add = true; } }
      if(add) await setJSON(K_BET(pid), cur, true);
    }
  },[]);

  useEffect(()=>{ (async()=>{
    await ensureSeed();
    await refresh();
    const me = await sGet(K_ME,false);
    if(me) setMeId(me);
    setLoaded(true);
  })(); },[refresh,ensureSeed]);

  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),20000); return ()=>clearInterval(t); },[]);
  useEffect(()=>{ const t=setInterval(()=>{ refresh(); },25000); return ()=>clearInterval(t); },[refresh]);

  const me = useMemo(()=> players.find(p=>p.id===meId) || null, [players,meId]);

  /* ----- login / cadastro ----- */
  const login = useCallback(async (name, fav)=>{
    const ps = await getJSON(K_PLAYERS,true,[]) || [];
    let p = ps.find(x=> norm(x.name)===norm(name));
    if(p){ if(fav && p.favTeam!==fav){ p.favTeam=fav; await setJSON(K_PLAYERS, ps, true); } }
    else { p = { id:"p-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:name.trim(), favTeam:fav, createdAt:Date.now() }; ps.push(p); await setJSON(K_PLAYERS, ps, true); }
    await sSet(K_ME, p.id, false);
    setMeId(p.id);
    await refresh();
    showToast(`Bora, ${p.name.split(" ")[0]}! Boa sorte ⚽`);
  },[refresh,showToast]);

  const logout = useCallback(async ()=>{ await sSet(K_ME,"",false); setMeId(null); },[]);

  /* ----- salvar palpite ----- */
  const saveBet = useCallback(async (matchId, h, a)=>{
    if(!meId) return;
    const mine = await getJSON(K_BET(meId),true,{}) || {};
    if(h===""||a===""||h==null||a==null){ delete mine[matchId]; }
    else { mine[matchId] = { h:Math.max(0,Math.min(19,parseInt(h,10)||0)), a:Math.max(0,Math.min(19,parseInt(a,10)||0)) }; }
    await setJSON(K_BET(meId), mine, true);
    setBets(prev=>({ ...prev, [meId]: mine }));
    showToast("Palpite salvo");
  },[meId,showToast]);

  /* ----- admin: salvar matches / settings ----- */
  const saveMatches = useCallback(async (ms)=>{ setMatches(ms); await setJSON(K_MATCHES, ms, true); },[]);
  const saveSettings = useCallback(async (st)=>{ setSettings(st); await setJSON(K_SETTINGS, st, true); },[]);

  /* ----- rankings ----- */
  const totals = useMemo(()=>{
    return players.map(p=>{
      let computed=0; const perMatch={};
      for(const m of matches){
        const r = scoreMatch(bets[p.id]?.[m.id], m, p.favTeam);
        computed += r.pts; perMatch[m.id]=r;
      }
      const total = (p.base||0) + computed;
      return { ...p, computed, total, perMatch };
    }).sort((a,b)=> b.total-a.total || (a.seedRank??999)-(b.seedRank??999) || a.name.localeCompare(b.name,"pt"));
  },[players,matches,bets]);

  const finishedSorted = useMemo(()=> matches.filter(m=>m.finished).sort((a,b)=> kickoffMs(b)-kickoffMs(a)), [matches]);
  const last4 = finishedSorted.slice(0,4);

  if(!loaded) return <Splash/>;

  return (
    <div className="cb-root">
      <StyleTag/>
      <Pitch/>
      <div className="cb-shell">
        <Header me={me} onLogout={logout} totals={totals}/>
        {!me ? (
          <Onboarding onLogin={login}/>
        ) : (
          <>
            <Nav tab={tab} setTab={setTab}/>
            {tab==="jogos" && (
              <JogosTab matches={matches} players={players} bets={bets} me={me} now={now}
                        settings={settings} onSaveBet={saveBet}/>
            )}
            {tab==="ranking" && (
              <RankingTab totals={totals} matches={matches} last4={last4} bets={bets}/>
            )}
            {tab==="regras" && <RegrasTab/>}
            {tab==="admin" && (
              <AdminTab matches={matches} settings={settings} onSaveMatches={saveMatches}
                        onSaveSettings={saveSettings} onReseed={()=>saveMatches(SEED_MATCHES)} showToast={showToast}/>
            )}
          </>
        )}
        <footer className="cb-foot">Chalana's Bet · Bolão Copa 2026 — horários em Brasília (BRT)</footer>
      </div>
      {toast && <div className="cb-toast">{toast}</div>}
    </div>
  );
}

/* ============================ COMPONENTES ============================ */

function Splash(){ return (<div className="cb-root"><StyleTag/><div className="cb-splash"><span className="cb-ball">⚽</span><b>CHALANA'S BET</b></div></div>); }

function Header({me,onLogout,totals}){
  const myRank = me ? totals.findIndex(t=>t.id===me.id)+1 : 0;
  return (
    <header className="cb-header">
      <div className="cb-brand">
        <div className="cb-shield"><Shield size={20} strokeWidth={2.5}/><span className="cb-shield-ball">⚽</span></div>
        <div>
          <h1>CHALANA'S BET</h1>
          <p>Bolão Copa do Mundo 2026</p>
        </div>
      </div>
      {me && (
        <div className="cb-me">
          <div className="cb-me-info">
            <span className="cb-me-name">{me.name}</span>
            <span className="cb-me-fav">{flag(me.favTeam)} {me.favTeam} · {myRank}º lugar</span>
          </div>
          <button className="cb-icon-btn" title="Trocar jogador" onClick={onLogout}><LogOut size={16}/></button>
        </div>
      )}
    </header>
  );
}

function Onboarding({onLogin}){
  const [name,setName] = useState("");
  const [fav,setFav] = useState("Brasil");
  const can = name.trim().length>=2;
  return (
    <div className="cb-onb">
      <div className="cb-onb-card">
        <span className="cb-eyebrow">Entrar no bolão</span>
        <h2>Qual é o seu nome em campo?</h2>
        <p className="cb-onb-sub">Sem cadastro, sem senha. Só seu nome e o time do coração — ele vale <b>±0,5 ponto</b> por jogo.</p>
        <label className="cb-label">Seu nome</label>
        <input className="cb-input cb-input-lg" value={name} maxLength={24}
               onChange={e=>setName(e.target.value)} placeholder="Ex: Diego Paz"
               onKeyDown={e=>{ if(e.key==="Enter"&&can) onLogin(name,fav); }}/>
        <label className="cb-label">Time favorito</label>
        <div className="cb-select-wrap">
          <span className="cb-select-flag">{flag(fav)}</span>
          <select className="cb-select" value={fav} onChange={e=>setFav(e.target.value)}>
            {FAV_TEAMS.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={16} className="cb-select-caret"/>
        </div>
        <button className="cb-btn cb-btn-primary cb-btn-block" disabled={!can} onClick={()=>onLogin(name,fav)}>
          Entrar no Chalana's Bet
        </button>
        <p className="cb-onb-note">Já entrou antes? Digite o mesmo nome para voltar à sua conta.</p>
      </div>
    </div>
  );
}

function Nav({tab,setTab}){
  const items = [["jogos","Jogos",Calendar],["ranking","Ranking",Trophy],["regras","Regras",Shield],["admin","Admin",Settings]];
  return (
    <nav className="cb-nav">
      {items.map(([k,label,Icon])=>(
        <button key={k} className={"cb-tab"+(tab===k?" cb-tab-on":"")} onClick={()=>setTab(k)}>
          <Icon size={16}/><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------------------------- JOGOS ---------------------------- */
function JogosTab({matches,players,bets,me,now,settings,onSaveBet}){
  // agrupa por rodada -> data
  const groups = useMemo(()=>{
    const byR = {};
    [...matches].sort((a,b)=> ROUND_ORDER(a.rodada)-ROUND_ORDER(b.rodada) || kickoffMs(a)-kickoffMs(b))
      .forEach(m=>{ (byR[m.rodada] = byR[m.rodada]||[]).push(m); });
    return Object.entries(byR).map(([rodada,ms])=>{
      const byD = {};
      ms.forEach(m=>{ (byD[m.date]=byD[m.date]||[]).push(m); });
      return { rodada, days:Object.entries(byD).sort((a,b)=>a[0].localeCompare(b[0])) };
    });
  },[matches]);

  return (
    <div className="cb-page">
      {groups.map(g=>(
        <section key={g.rodada} className="cb-round">
          <div className="cb-round-head"><span className="cb-round-tag">Fase de grupos</span><h3>{g.rodada}</h3></div>
          {g.days.map(([date,ms])=>(
            <div key={date} className="cb-day">
              <div className="cb-day-label"><Calendar size={13}/> {dateLabel(date)}</div>
              <div className="cb-matches">
                {ms.map(m=> <MatchCard key={m.id} m={m} players={players} bets={bets} me={me} now={now} settings={settings} onSaveBet={onSaveBet}/>)}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function MatchCard({m,players,bets,me,now,settings,onSaveBet}){
  const [open,setOpen] = useState(false);
  const kMs = kickoffMs(m);
  const lockMin = m.lockMin ?? 15;
  const lockMs = kMs - lockMin*60*1000;
  const locked = now >= lockMs;
  const mine = bets[me.id]?.[m.id];
  const [h,setH] = useState(mine?.h ?? "");
  const [a,setA] = useState(mine?.a ?? "");
  useEffect(()=>{ setH(mine?.h ?? ""); setA(mine?.a ?? ""); },[mine?.h,mine?.a]);

  const dirty = String(h)!==String(mine?.h ?? "") || String(a)!==String(mine?.a ?? "");
  const editable = !m.finished && !locked;
  const betCount = players.filter(p=> bets[p.id]?.[m.id]).length;
  const revealOthers = m.finished || locked || settings.revealBeforeLock;

  let status, statusClass;
  if(m.finished){ status="Encerrado"; statusClass="cb-st-done"; }
  else if(locked){ status="Palpites fechados"; statusClass="cb-st-lock"; }
  else status = "Fecha em " + timeLeft(lockMs-now);

  return (
    <div className={"cb-match"+(m.finished?" cb-match-done":"")}>
      <div className="cb-match-top">
        <span className="cb-time">{m.time}</span>
        <div className="cb-top-right">
          {!m.finished && lockMin!==15 && (
            <span className="cb-window" title="Janela de palpites antes do jogo">trava {lockMin>=60?`${lockMin/60}h`:`${lockMin}min`} antes</span>
          )}
          <span className={"cb-status "+(statusClass||"cb-st-open")}>
            {(!m.finished && locked) && <Lock size={11}/>}{status}
          </span>
        </div>
      </div>

      {/* placar estilo painel */}
      <div className="cb-score">
        <div className="cb-team cb-team-h"><span className="cb-flag">{flag(m.home)}</span><span className="cb-tname">{m.home}</span></div>
        <div className="cb-score-box">
          {m.finished
            ? <><b>{m.realH}</b><i>×</i><b>{m.realA}</b></>
            : <><b className="cb-vs">VS</b></>}
        </div>
        <div className="cb-team cb-team-a"><span className="cb-tname">{m.away}</span><span className="cb-flag">{flag(m.away)}</span></div>
      </div>

      {/* meu palpite */}
      {!m.finished && (
        <div className="cb-betrow">
          <span className="cb-betlabel">Seu palpite</span>
          <div className="cb-betinputs">
            <input className="cb-pick" type="number" min="0" max="19" inputMode="numeric"
                   disabled={!editable} value={h} onChange={e=>setH(e.target.value)} aria-label={`gols ${m.home}`}/>
            <span className="cb-x">×</span>
            <input className="cb-pick" type="number" min="0" max="19" inputMode="numeric"
                   disabled={!editable} value={a} onChange={e=>setA(e.target.value)} aria-label={`gols ${m.away}`}/>
            {editable
              ? <button className="cb-btn cb-btn-sm cb-btn-primary" disabled={!dirty || h===""||a===""}
                        onClick={()=>onSaveBet(m.id,h,a)}>{mine?"Atualizar":"Salvar"}</button>
              : <span className="cb-locktag"><Lock size={12}/>{mine?`${mine.h}×${mine.a}`:"sem palpite"}</span>}
          </div>
        </div>
      )}

      {/* resultado do meu palpite */}
      {m.finished && mine && <MyResult m={m} bet={mine} fav={me.favTeam}/>}
      {m.finished && !mine && <div className="cb-noresult">Você não palpitou neste jogo.</div>}

      {/* palpites de todos */}
      <button className="cb-allbtn" onClick={()=>setOpen(o=>!o)}>
        <Users size={13}/> Palpites de todos · {betCount}
        <ChevronDown size={14} className={"cb-caret"+(open?" cb-caret-up":"")}/>
      </button>
      {open && (
        <div className="cb-allbets">
          {betCount===0 && <div className="cb-empty-sm">Ninguém palpitou ainda.</div>}
          {players.filter(p=>bets[p.id]?.[m.id]).map(p=>{
            const b = bets[p.id][m.id];
            const r = m.finished ? scoreMatch(b,m,p.favTeam) : null;
            return (
              <div key={p.id} className={"cb-allbet"+(p.id===me.id?" cb-allbet-me":"")}>
                <span className="cb-ab-name">{flag(p.favTeam)} {p.name}{p.id===me.id && <em className="cb-voce">VOCÊ</em>}</span>
                {revealOthers || p.id===me.id
                  ? <span className="cb-ab-pick">{b.h}×{b.a}{r && r.pts!==0 && <em className={"cb-ab-pts"+(r.pts<0?" cb-neg":"")}>{r.pts>0?"+":""}{fmtPts(r.pts)}</em>}</span>
                  : <span className="cb-ab-pick cb-ab-hidden"><Lock size={11}/></span>}
              </div>
            );
          })}
          {!revealOthers && betCount>0 && <div className="cb-hint">Palpites dos outros aparecem quando o jogo fecha.</div>}
        </div>
      )}
    </div>
  );
}

function MyResult({m,bet,fav}){
  const r = scoreMatch(bet,m,fav);
  return (
    <div className={"cb-myresult"+(r.pts>0?" cb-pos":r.pts<0?" cb-neg":"")}>
      <span>Seu palpite: <b>{bet.h}×{bet.a}</b></span>
      <span className="cb-mr-pts">{r.pts>0?"+":""}{fmtPts(r.pts)} pt{Math.abs(r.pts)===1?"":"s"}</span>
      {r.reasons.length>0 && <span className="cb-mr-reason">{r.reasons.join(" · ")}</span>}
    </div>
  );
}

function timeLeft(ms){
  if(ms<=0) return "agora";
  const min = Math.floor(ms/60000), d=Math.floor(min/1440), h=Math.floor((min%1440)/60), mm=min%60;
  if(d>0) return `${d}d ${h}h`;
  if(h>0) return `${h}h ${mm}min`;
  return `${mm}min`;
}

/* ---------------------------- RANKING ---------------------------- */
function RankingTab({totals,matches,last4,bets}){
  const rounds = useMemo(()=>[...new Set(matches.map(m=>m.rodada))].sort((a,b)=>ROUND_ORDER(a)-ROUND_ORDER(b)),[matches]);
  const roundsWithResults = rounds.filter(r=> matches.some(m=>m.rodada===r && m.finished));
  const [sel,setSel] = useState("");
  useEffect(()=>{ if(!sel && roundsWithResults.length) setSel(roundsWithResults[roundsWithResults.length-1]); },[roundsWithResults,sel]);

  const roundBreak = useMemo(()=>{
    if(!sel) return [];
    const ms = matches.filter(m=>m.rodada===sel && m.finished);
    return totals.map(p=>{
      let pts=0; const lines=[];
      for(const m of ms){
        const r = scoreMatch(bets[p.id]?.[m.id], m, p.favTeam);
        if(r.scored){ pts+=r.pts; lines.push({ m, r }); }
      }
      return { ...p, roundPts:pts, lines };
    }).filter(x=> x.lines.length>0).sort((a,b)=> b.roundPts-a.roundPts);
  },[sel,matches,totals,bets]);

  return (
    <div className="cb-page">
      {/* últimos resultados */}
      <section className="cb-block">
        <h3 className="cb-block-title"><Flame size={15}/> Últimos resultados</h3>
        {last4.length===0
          ? <div className="cb-empty">Assim que um jogo for encerrado no Admin, o placar aparece aqui.</div>
          : <div className="cb-results">
              {last4.map(m=>(
                <div key={m.id} className="cb-rescard">
                  <span className="cb-res-round">{m.rodada}</span>
                  <div className="cb-res-line">
                    <span>{flag(m.home)} {m.home}</span>
                    <b>{m.realH}×{m.realA}</b>
                    <span>{m.away} {flag(m.away)}</span>
                  </div>
                </div>
              ))}
            </div>}
      </section>

      {/* classificação geral */}
      <section className="cb-block">
        <h3 className="cb-block-title"><Trophy size={15}/> Classificação geral</h3>
        {totals.length===0
          ? <div className="cb-empty">Ninguém entrou no bolão ainda.</div>
          : <div className="cb-table">
              {totals.map((p,i)=>(
                <div key={p.id} className={"cb-row"+(i<3?` cb-row-top cb-row-${i+1}`:"")}>
                  <span className="cb-pos">{i+1}</span>
                  <div className="cb-row-main">
                    <span className="cb-row-name">{flag(p.favTeam)} {p.name}</span>
                    <span className="cb-row-fav">{p.favTeam}{p.base?` · base ${fmtPts(p.base)}`:""}{p.computed?` · rodadas ${p.computed>0?"+":""}${fmtPts(p.computed)}`:""}</span>
                  </div>
                  <span className="cb-row-pts">{fmtPts(p.total)}<i>pts</i></span>
                </div>
              ))}
            </div>}
      </section>

      {/* pontuação da rodada */}
      <section className="cb-block">
        <div className="cb-block-titlebar">
          <h3 className="cb-block-title"><Shield size={15}/> Quem pontuou na rodada</h3>
          {roundsWithResults.length>0 && (
            <div className="cb-select-wrap cb-select-sm">
              <select className="cb-select" value={sel} onChange={e=>setSel(e.target.value)}>
                {roundsWithResults.map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="cb-select-caret"/>
            </div>
          )}
        </div>
        {roundBreak.length===0
          ? <div className="cb-empty">Nenhuma pontuação nessa rodada ainda.</div>
          : <div className="cb-break">
              {roundBreak.map(p=>(
                <div key={p.id} className="cb-breakrow">
                  <div className="cb-break-head">
                    <span>{flag(p.favTeam)} {p.name}</span>
                    <b className={p.roundPts<0?"cb-neg":"cb-pos"}>{p.roundPts>0?"+":""}{fmtPts(p.roundPts)} pts</b>
                  </div>
                  <div className="cb-break-lines">
                    {p.lines.map(({m,r},idx)=>(
                      <div key={idx} className="cb-break-line">
                        <span className="cb-bl-game">{flag(m.home)} {m.realH}×{m.realA} {flag(m.away)}</span>
                        <span className="cb-bl-reason">{r.reasons.join(" · ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>}
      </section>
    </div>
  );
}

/* ---------------------------- REGRAS ---------------------------- */
function RegrasTab(){
  const rules = [
    ["5","Placar exato","Cravou os dois gols. Empate exato também vale 5 (ex.: apostou 1×1 e deu 1×1)."],
    ["3+1","Vencedor + parcial","Acertou quem ganhou (3) e ainda um dos placares (1) = 4 pontos. Só o vencedor, sem parcial, vale 3."],
    ["2","Empate diferente","Apostou empate e deu empate com outro placar. Ex.: apostou 1×1 e deu 2×2."],
    ["1","Placar parcial","Acertou um dos lados — inclusive quando o jogo termina empatado. Ex.: apostou 2×1 e deu 1×1, acertou o 1 do visitante."],
    ["±½","Time favorito","+0,5 se seu favorito vencer · −0,5 se perder. Empate do favorito não soma nem tira. Vale mesmo sem palpite no jogo."],
  ];
  return (
    <div className="cb-page">
      <section className="cb-block">
        <h3 className="cb-block-title"><Shield size={15}/> Como pontua</h3>
        <div className="cb-rules">
          {rules.map(([n,t,d])=>(
            <div key={t} className="cb-rule">
              <span className="cb-rule-pts">{n}</span>
              <div><b>{t}</b><p>{d}</p></div>
            </div>
          ))}
        </div>
        <div className="cb-rules-note">
          O <b>vencedor (3)</b> soma com o <b>placar parcial (1)</b>. O empate exato conta como placar exato (<b>5</b>),
          e o parcial vale também quando o jogo termina empatado. O bônus do <b>favorito</b> sempre soma por cima.
          Os palpites travam <b>15 minutos antes</b> de cada jogo (2h nos jogos de hoje).
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- ADMIN ---------------------------- */
function AdminTab({matches,settings,onSaveMatches,onSaveSettings,onReseed,showToast}){
  const [pin,setPin] = useState("");
  const [ok,setOk] = useState(false);
  const [draft,setDraft] = useState(matches);
  const [iaStatus,setIaStatus] = useState(null);
  // draft é inicializado uma vez (useState). Não re-sincroniza no refresh para não apagar edições.

  if(!ok) return (
    <div className="cb-page">
      <div className="cb-onb-card cb-admin-gate">
        <span className="cb-eyebrow">Área do organizador</span>
        <h2>Senha do Admin</h2>
        <p className="cb-onb-sub">Edite jogos, lance resultados e ajuste a tabela. Acesso restrito ao organizador.</p>
        <input className="cb-input" type="password" value={pin} onChange={e=>setPin(e.target.value)}
               placeholder="Senha" onKeyDown={e=>{ if(e.key==="Enter") setOk(pin===ADMIN_PIN); }}/>
        <button className="cb-btn cb-btn-primary cb-btn-block" onClick={()=>{ if(pin===ADMIN_PIN) setOk(true); else showToast("Senha incorreta"); }}>Entrar</button>
      </div>
    </div>
  );

  const upd = (id,patch)=> setDraft(d=> d.map(m=> m.id===id? {...m,...patch}: m));
  const addMatch = ()=> setDraft(d=> [...d, { id:"m-"+Date.now().toString(36), rodada:"2ª rodada", date:"2026-06-22", time:"16:00", home:"Brasil", away:"Marrocos", lockMin:15, realH:null, realA:null, finished:false }]);
  const del = (id)=> setDraft(d=> d.filter(m=> m.id!==id));
  const save = ()=>{ onSaveMatches(draft); showToast("Tabela salva para todos"); };
  const reseed = ()=>{ setDraft(SEED_MATCHES); onReseed(); showToast("Tabela oficial restaurada"); };

  async function atualizarIA(){
    setIaStatus("Buscando dados oficiais (datas, horários e placares)…");
    try{
      const res = await fetch("/api/atualizar", { method:"POST", headers:{"Content-Type":"application/json"} });
      const data = await res.json();
      if(data.error){ setIaStatus("Erro: "+data.error); return; }
      const arr = Array.isArray(data.matches) ? data.matches : [];
      let applied=0;
      const next = draft.map(m=>{
        const hit = arr.find(r=> (teamKey(r.home)===teamKey(m.home) && teamKey(r.away)===teamKey(m.away))
                              || (teamKey(r.home)===teamKey(m.away) && teamKey(r.away)===teamKey(m.home)));
        if(!hit) return m;
        const swap = teamKey(hit.home)===teamKey(m.away);
        const nm = {...m}; let touched=false;
        if(typeof hit.date==="string" && /^\d{4}-\d{2}-\d{2}$/.test(hit.date)){ nm.date=hit.date; touched=true; }
        if(typeof hit.time==="string" && /^\d{1,2}:\d{2}$/.test(hit.time)){ nm.time=hit.time.padStart(5,"0"); touched=true; }
        if(hit.homeScore!=null && hit.awayScore!=null){
          nm.realH = swap?hit.awayScore:hit.homeScore;
          nm.realA = swap?hit.homeScore:hit.awayScore;
          nm.finished = true; touched=true;
        }
        if(touched) applied++;
        return nm;
      });
      setDraft(next); onSaveMatches(next);
      setIaStatus(applied>0 ? `✓ ${applied} jogo(s) atualizado(s) (data/hora/placar). Confira e salve.` : "Nenhum jogo da tabela foi atualizado. Ajuste manualmente abaixo.");
    }catch(e){
      setIaStatus("Não consegui buscar agora. Ajuste datas, horários e placares manualmente abaixo.");
    }
  }

  return (
    <div className="cb-page">
      <section className="cb-block">
        <h3 className="cb-block-title"><RefreshCw size={15}/> Atualizar resultados</h3>
        <p className="cb-admin-p">Busca placares finais da Copa 2026 na web e preenche os jogos da tabela. É um apoio — confira sempre antes de salvar.</p>
        <div className="cb-admin-actions">
          <button className="cb-btn cb-btn-primary" onClick={atualizarIA}><RefreshCw size={14}/> Atualizar via IA</button>
          <button className="cb-btn cb-btn-ghost" onClick={reseed}>Restaurar tabela oficial</button>
        </div>
        {iaStatus && <div className="cb-iastatus">{iaStatus}</div>}
      </section>

      <section className="cb-block">
        <div className="cb-block-titlebar">
          <h3 className="cb-block-title"><Settings size={15}/> Jogos da tabela</h3>
          <button className="cb-btn cb-btn-sm cb-btn-ghost" onClick={addMatch}><Plus size={14}/> Jogo</button>
        </div>

        <label className="cb-switch">
          <input type="checkbox" checked={!!settings.revealBeforeLock}
                 onChange={e=>onSaveSettings({...settings, revealBeforeLock:e.target.checked})}/>
          <span>Mostrar palpites dos outros antes do jogo fechar</span>
        </label>

        <div className="cb-adminlist">
          {draft.map(m=>(
            <div key={m.id} className="cb-adminrow">
              <div className="cb-ar-line">
                <input className="cb-input cb-ar-round" value={m.rodada} onChange={e=>upd(m.id,{rodada:e.target.value})}/>
                <input className="cb-input cb-ar-date" type="date" value={m.date} onChange={e=>upd(m.id,{date:e.target.value})}/>
                <input className="cb-input cb-ar-time" type="time" value={m.time} onChange={e=>upd(m.id,{time:e.target.value})}/>
                <input className="cb-input cb-ar-lock" type="number" min="0" title="Trava: minutos antes do jogo" value={m.lockMin??15} onChange={e=>upd(m.id,{lockMin:e.target.value===""?15:parseInt(e.target.value,10)})}/>
                <span className="cb-ar-locku">min</span>
                <button className="cb-icon-btn cb-del" onClick={()=>del(m.id)}><X size={14}/></button>
              </div>
              <div className="cb-ar-line">
                <select className="cb-select cb-ar-team" value={m.home} onChange={e=>upd(m.id,{home:e.target.value})}>
                  {FAV_TEAMS.map(t=><option key={t}>{t}</option>)}
                </select>
                <input className="cb-pick cb-ar-sc" type="number" min="0" placeholder="-" value={m.realH??""} onChange={e=>upd(m.id,{realH:e.target.value===""?null:parseInt(e.target.value,10)})}/>
                <span className="cb-x">×</span>
                <input className="cb-pick cb-ar-sc" type="number" min="0" placeholder="-" value={m.realA??""} onChange={e=>upd(m.id,{realA:e.target.value===""?null:parseInt(e.target.value,10)})}/>
                <select className="cb-select cb-ar-team" value={m.away} onChange={e=>upd(m.id,{away:e.target.value})}>
                  {FAV_TEAMS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <label className="cb-switch cb-switch-sm">
                <input type="checkbox" checked={!!m.finished} onChange={e=>upd(m.id,{finished:e.target.checked})}/>
                <span>Encerrado (conta no ranking)</span>
              </label>
            </div>
          ))}
        </div>
        <button className="cb-btn cb-btn-primary cb-btn-block" onClick={save}><Check size={15}/> Salvar tabela para todos</button>
      </section>
    </div>
  );
}

function Pitch(){ return <div className="cb-pitch" aria-hidden="true"/>; }

/* ============================== ESTILO ============================== */
function StyleTag(){
  return <style>{`
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.cb-root{
  --verde:#0aa64a; --verde2:#067a36; --campo:#0b3a22; --campo2:#0a2e1b;
  --amarelo:#ffd200; --amarelo2:#f4b400; --azul:#16307a; --azul2:#0f2152;
  --branco:#f3f6f1; --ink:#08130c; --panel:#0e2418; --panel2:#102b1c;
  --line:rgba(255,255,255,.10); --muted:rgba(243,246,241,.62);
  --pos:#34d27b; --neg:#ff6b6b;
  font-family:'Inter',system-ui,sans-serif; color:var(--branco);
  position:relative; min-height:100%; background:var(--campo2);
}
.cb-root *{box-sizing:border-box}
.cb-pitch{position:fixed;inset:0;z-index:0;background:
  radial-gradient(120% 80% at 50% -10%, rgba(10,166,74,.30), transparent 60%),
  repeating-linear-gradient(180deg, #0c3a22 0 64px, #0a3420 64px 128px);}
.cb-pitch::after{content:"";position:absolute;inset:0;background:
  radial-gradient(closest-side, transparent 86px, rgba(255,255,255,.05) 87px, transparent 89px) 50% 38%/220px 220px no-repeat;}
.cb-shell{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:18px 16px 40px;}

/* header */
.cb-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;}
.cb-brand{display:flex;align-items:center;gap:12px;}
.cb-shield{position:relative;width:42px;height:42px;display:grid;place-items:center;border-radius:11px;
  background:linear-gradient(150deg,var(--amarelo),var(--amarelo2));color:var(--azul2);
  box-shadow:0 6px 18px rgba(0,0,0,.35),inset 0 0 0 2px rgba(255,255,255,.4);}
.cb-shield-ball{position:absolute;font-size:13px;bottom:-3px;right:-3px;}
.cb-brand h1{font-family:'Oswald';font-weight:700;font-size:23px;letter-spacing:.5px;margin:0;line-height:1;}
.cb-brand p{margin:3px 0 0;font-size:12px;color:var(--muted);letter-spacing:.3px;}
.cb-me{display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);
  border-radius:12px;padding:7px 9px 7px 12px;}
.cb-me-info{display:flex;flex-direction:column;line-height:1.25;text-align:right;}
.cb-me-name{font-weight:700;font-size:13px;}
.cb-me-fav{font-size:11px;color:var(--muted);}
.cb-icon-btn{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--branco);
  width:30px;height:30px;border-radius:8px;display:grid;place-items:center;cursor:pointer;}
.cb-icon-btn:hover{background:rgba(255,255,255,.12);}

/* nav */
.cb-nav{display:flex;gap:6px;background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:5px;margin-bottom:16px;}
.cb-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 6px;border:0;border-radius:9px;
  background:transparent;color:var(--muted);font-family:'Inter';font-weight:600;font-size:13px;cursor:pointer;transition:.15s;}
.cb-tab:hover{color:var(--branco);}
.cb-tab-on{background:linear-gradient(180deg,var(--verde),var(--verde2));color:#fff;box-shadow:0 4px 12px rgba(10,166,74,.4);}

/* onboarding */
.cb-onb{display:flex;justify-content:center;padding-top:10px;}
.cb-onb-card{width:100%;max-width:440px;background:var(--panel);border:1px solid var(--line);
  border-radius:18px;padding:26px 22px;box-shadow:0 20px 50px rgba(0,0,0,.4);}
.cb-eyebrow{font-family:'Oswald';text-transform:uppercase;letter-spacing:2px;font-size:11px;color:var(--amarelo);font-weight:600;}
.cb-onb-card h2{font-family:'Oswald';font-weight:600;font-size:25px;margin:8px 0 6px;line-height:1.1;}
.cb-onb-sub{font-size:13px;color:var(--muted);margin:0 0 18px;line-height:1.5;}
.cb-label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin:12px 0 6px;}
.cb-input{width:100%;background:#0a1c12;border:1px solid var(--line);border-radius:10px;color:var(--branco);
  padding:11px 13px;font-size:14px;font-family:'Inter';outline:none;}
.cb-input:focus{border-color:var(--amarelo);}
.cb-input-lg{font-size:16px;padding:13px;}
.cb-onb-note{font-size:11.5px;color:var(--muted);margin:14px 0 0;text-align:center;}
.cb-select-wrap{position:relative;display:flex;align-items:center;}
.cb-select{width:100%;appearance:none;background:#0a1c12;border:1px solid var(--line);border-radius:10px;
  color:var(--branco);padding:11px 34px 11px 13px;font-size:14px;font-family:'Inter';outline:none;cursor:pointer;}
.cb-select:focus{border-color:var(--amarelo);}
.cb-select option{background:#0a1c12;}
.cb-select-flag{position:absolute;left:11px;pointer-events:none;font-size:15px;z-index:2;}
.cb-select-wrap:has(.cb-select-flag) .cb-select{padding-left:36px;}
.cb-select-caret{position:absolute;right:11px;pointer-events:none;color:var(--muted);}
.cb-select-sm .cb-select{padding:7px 30px 7px 11px;font-size:12.5px;}

/* botões */
.cb-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:10px;
  font-family:'Inter';font-weight:700;font-size:14px;padding:11px 16px;cursor:pointer;transition:.15s;}
.cb-btn:disabled{opacity:.4;cursor:not-allowed;}
.cb-btn-primary{background:linear-gradient(180deg,var(--amarelo),var(--amarelo2));color:var(--azul2);
  box-shadow:0 4px 14px rgba(255,210,0,.3);}
.cb-btn-primary:hover:not(:disabled){filter:brightness(1.05);}
.cb-btn-ghost{background:rgba(255,255,255,.06);color:var(--branco);border:1px solid var(--line);}
.cb-btn-ghost:hover{background:rgba(255,255,255,.12);}
.cb-btn-block{width:100%;margin-top:18px;}
.cb-btn-sm{padding:7px 12px;font-size:12.5px;border-radius:8px;}

/* página / rodadas */
.cb-page{display:flex;flex-direction:column;gap:18px;}
.cb-round-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.cb-round-tag{font-family:'Oswald';text-transform:uppercase;letter-spacing:1.5px;font-size:10px;color:var(--azul2);
  background:var(--amarelo);padding:3px 8px;border-radius:5px;font-weight:600;}
.cb-round-head h3{font-family:'Oswald';font-weight:600;font-size:19px;margin:0;}
.cb-day{margin-bottom:14px;}
.cb-day-label{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--amarelo);
  text-transform:capitalize;margin:4px 0 8px;}
.cb-matches{display:flex;flex-direction:column;gap:10px;}

/* match card */
.cb-match{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:13px 14px;}
.cb-match-done{background:linear-gradient(180deg,var(--panel2),var(--panel));border-color:rgba(255,210,0,.18);}
.cb-match-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
.cb-top-right{display:flex;align-items:center;gap:7px;}
.cb-window{font-size:10px;font-weight:600;color:#ffd9a8;background:rgba(255,150,0,.12);padding:3px 7px;border-radius:20px;}
.cb-time{font-family:'Oswald';font-weight:600;font-size:14px;color:var(--branco);}
.cb-status{font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;}
.cb-st-open{color:#bfe9cf;background:rgba(52,210,123,.12);}
.cb-st-lock{color:#ffd9a8;background:rgba(255,150,0,.14);}
.cb-st-done{color:var(--azul2);background:var(--amarelo);}

.cb-score{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin:4px 0 10px;}
.cb-team{display:flex;align-items:center;gap:8px;min-width:0;}
.cb-team-h{justify-content:flex-end;text-align:right;}
.cb-flag{font-size:22px;line-height:1;}
.cb-tname{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cb-score-box{display:flex;align-items:center;gap:7px;background:var(--ink);border:1px solid var(--line);
  border-radius:9px;padding:6px 11px;font-family:'Oswald';}
.cb-score-box b{font-size:23px;font-weight:700;color:var(--amarelo);min-width:16px;text-align:center;}
.cb-score-box i{color:var(--muted);font-style:normal;font-size:15px;}
.cb-vs{font-size:14px!important;color:var(--muted)!important;letter-spacing:1px;}

/* bet row */
.cb-betrow{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--line);padding-top:10px;}
.cb-betlabel{font-size:12px;font-weight:600;color:var(--muted);}
.cb-betinputs{display:flex;align-items:center;gap:7px;}
.cb-pick{width:42px;height:38px;text-align:center;background:#0a1c12;border:1px solid var(--line);border-radius:9px;
  color:var(--branco);font-family:'Oswald';font-size:18px;font-weight:600;outline:none;-moz-appearance:textfield;}
.cb-pick::-webkit-outer-spin-button,.cb-pick::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.cb-pick:focus{border-color:var(--amarelo);}
.cb-pick:disabled{opacity:.55;}
.cb-x{color:var(--muted);font-weight:600;}
.cb-locktag{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:var(--muted);
  font-family:'Oswald';}

/* my result */
.cb-myresult{display:flex;flex-wrap:wrap;align-items:center;gap:8px;border-top:1px solid var(--line);padding-top:10px;font-size:12.5px;}
.cb-myresult b{font-family:'Oswald';}
.cb-mr-pts{margin-left:auto;font-family:'Oswald';font-weight:700;font-size:15px;}
.cb-pos .cb-mr-pts,.cb-pos{color:var(--pos);}
.cb-neg .cb-mr-pts,.cb-neg{color:var(--neg);}
.cb-myresult.cb-pos{color:var(--branco);} .cb-myresult.cb-neg{color:var(--branco);}
.cb-mr-reason{flex-basis:100%;color:var(--muted);font-size:11.5px;}
.cb-noresult{border-top:1px solid var(--line);padding-top:9px;font-size:12px;color:var(--muted);}

/* all bets */
.cb-allbtn{width:100%;margin-top:10px;display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.04);
  border:1px solid var(--line);border-radius:9px;color:var(--muted);font-weight:600;font-size:12.5px;
  padding:8px 11px;cursor:pointer;}
.cb-allbtn:hover{color:var(--branco);}
.cb-caret{margin-left:auto;transition:.2s;}
.cb-caret-up{transform:rotate(180deg);}
.cb-allbets{margin-top:8px;display:flex;flex-direction:column;gap:5px;}
.cb-allbet{display:flex;align-items:center;justify-content:space-between;background:#0a1c12;border-radius:8px;padding:7px 11px;font-size:12.5px;}
.cb-allbet-me{background:rgba(255,210,0,.10);border:1px solid rgba(255,210,0,.25);}
.cb-ab-name{font-weight:600;display:flex;align-items:center;gap:6px;}
.cb-voce{font-style:normal;font-size:9px;font-weight:700;background:var(--amarelo);color:var(--azul2);padding:1px 5px;border-radius:4px;letter-spacing:.5px;}
.cb-ab-pick{font-family:'Oswald';font-weight:600;font-size:15px;display:flex;align-items:center;gap:7px;}
.cb-ab-pts{font-style:normal;font-size:11px;color:var(--pos);}
.cb-ab-pts.cb-neg{color:var(--neg);}
.cb-ab-hidden{color:var(--muted);}
.cb-hint,.cb-empty-sm{font-size:11.5px;color:var(--muted);padding:4px 2px;}

/* blocos ranking */
.cb-block{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;}
.cb-block-title{display:flex;align-items:center;gap:8px;font-family:'Oswald';font-weight:600;font-size:17px;margin:0 0 12px;}
.cb-block-title svg{color:var(--amarelo);}
.cb-block-titlebar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;}
.cb-block-titlebar .cb-block-title{margin:0;}
.cb-empty{font-size:13px;color:var(--muted);text-align:center;padding:18px 8px;line-height:1.5;}

.cb-results{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.cb-rescard{background:#0a1c12;border:1px solid var(--line);border-radius:11px;padding:10px 11px;}
.cb-res-round{font-size:9.5px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:600;}
.cb-res-line{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:6px;font-size:12px;}
.cb-res-line b{font-family:'Oswald';font-size:17px;color:var(--amarelo);}
.cb-res-line span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38%;}

/* tabela classificação */
.cb-table{display:flex;flex-direction:column;gap:6px;}
.cb-row{display:flex;align-items:center;gap:12px;background:#0a1c12;border:1px solid var(--line);border-radius:11px;padding:10px 13px;}
.cb-pos{font-family:'Oswald';font-weight:700;font-size:17px;width:30px;height:30px;display:grid;place-items:center;
  border-radius:50%;background:rgba(255,255,255,.06);color:var(--muted);flex:none;}
.cb-row-top .cb-pos{color:var(--azul2);}
.cb-row-1 .cb-pos{background:linear-gradient(150deg,#ffe14d,#f4b400);}
.cb-row-2 .cb-pos{background:linear-gradient(150deg,#e6e6e6,#b9b9b9);}
.cb-row-3 .cb-pos{background:linear-gradient(150deg,#e8a86b,#c47b3d);}
.cb-row-main{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.3;}
.cb-row-name{font-weight:700;font-size:14px;}
.cb-row-fav{font-size:11px;color:var(--muted);}
.cb-row-pts{font-family:'Oswald';font-weight:700;font-size:21px;color:var(--amarelo);}
.cb-row-pts i{font-style:normal;font-size:11px;color:var(--muted);margin-left:3px;font-family:'Inter';}

/* breakdown rodada */
.cb-break{display:flex;flex-direction:column;gap:9px;}
.cb-breakrow{background:#0a1c12;border:1px solid var(--line);border-radius:11px;padding:11px 13px;}
.cb-break-head{display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:13.5px;}
.cb-break-head b{font-family:'Oswald';font-size:16px;}
.cb-break-lines{margin-top:7px;display:flex;flex-direction:column;gap:5px;}
.cb-break-line{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;}
.cb-bl-game{font-family:'Oswald';font-weight:600;color:var(--branco);}
.cb-bl-reason{color:var(--muted);}

/* regras */
.cb-rules{display:flex;flex-direction:column;gap:8px;}
.cb-rule{display:flex;align-items:center;gap:13px;background:#0a1c12;border:1px solid var(--line);border-radius:11px;padding:11px 13px;}
.cb-rule-pts{font-family:'Oswald';font-weight:700;font-size:20px;color:var(--azul2);background:var(--amarelo);
  min-width:42px;height:42px;display:grid;place-items:center;border-radius:10px;flex:none;}
.cb-rule b{font-size:14px;} .cb-rule p{margin:3px 0 0;font-size:12px;color:var(--muted);line-height:1.45;}
.cb-rules-note{margin-top:12px;font-size:12.5px;color:var(--muted);line-height:1.6;background:rgba(255,210,0,.07);
  border:1px solid rgba(255,210,0,.18);border-radius:10px;padding:11px 13px;}
.cb-rules-note b{color:var(--branco);}

/* admin */
.cb-admin-gate{max-width:420px;margin:0 auto;}
.cb-admin-gate code,.cb-onb-sub code{background:rgba(255,210,0,.15);color:var(--amarelo);padding:1px 6px;border-radius:5px;font-size:12px;}
.cb-admin-p{font-size:12.5px;color:var(--muted);line-height:1.5;margin:0 0 12px;}
.cb-admin-actions{display:flex;gap:8px;flex-wrap:wrap;}
.cb-iastatus{margin-top:11px;font-size:12.5px;color:var(--branco);background:rgba(255,255,255,.05);
  border:1px solid var(--line);border-radius:9px;padding:9px 12px;}
.cb-switch{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted);margin-bottom:13px;cursor:pointer;}
.cb-switch input{width:17px;height:17px;accent-color:var(--amarelo);}
.cb-switch-sm{margin:7px 0 0;font-size:11.5px;}
.cb-adminlist{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;}
.cb-adminrow{background:#0a1c12;border:1px solid var(--line);border-radius:11px;padding:10px;}
.cb-ar-line{display:flex;align-items:center;gap:7px;margin-bottom:7px;}
.cb-ar-line:last-child{margin-bottom:0;}
.cb-ar-round{flex:1;min-width:0;font-size:12px;padding:8px 10px;}
.cb-ar-date{width:140px;font-size:12px;padding:8px 10px;}
.cb-ar-time{width:104px;font-size:12px;padding:8px 10px;}
.cb-ar-lock{width:58px;font-size:12px;padding:8px 8px;text-align:center;}
.cb-ar-locku{font-size:11px;color:var(--muted);margin-left:-3px;}
.cb-ar-team{flex:1;min-width:0;padding:8px 28px 8px 10px;font-size:12.5px;}
.cb-ar-sc{width:46px;height:36px;font-size:16px;}
.cb-del{flex:none;color:var(--neg);}
.cb-input[type=date],.cb-input[type=time]{color-scheme:dark;}

/* misc */
.cb-foot{text-align:center;font-size:11px;color:var(--muted);margin-top:24px;}
.cb-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:50;background:var(--azul2);
  color:#fff;font-weight:600;font-size:13px;padding:11px 18px;border-radius:11px;box-shadow:0 10px 30px rgba(0,0,0,.5);
  border:1px solid rgba(255,255,255,.15);}
.cb-splash{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:14px;
  font-family:'Oswald';font-size:20px;letter-spacing:1px;color:var(--branco);}
.cb-ball{font-size:40px;animation:spin 1.4s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

@media(max-width:540px){
  .cb-brand h1{font-size:20px;} .cb-tab span{display:none;} .cb-tab{padding:10px;}
  .cb-results{grid-template-columns:1fr;}
  .cb-ar-line{flex-wrap:wrap;} .cb-ar-date,.cb-ar-time{width:auto;flex:1;}
  .cb-me-info{display:none;}
}
@media(prefers-reduced-motion:reduce){.cb-ball{animation:none;}}
`}</style>;
}
