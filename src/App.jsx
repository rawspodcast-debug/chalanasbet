import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Trophy, Lock, Shield, Users, RefreshCw, Settings, Plus, Check, ChevronDown, Calendar, Flame, X, Sliders } from "lucide-react";
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

// ===== MATA-MATA (confrontos definidos após a fase de grupos) =====
// home/away ficam null até o organizador definir os times. slotH/slotA = rótulo do confronto.
// Horários convertidos da grade oficial FIFA para Brasília (BRT = ET + 1h).
// Datas oficiais; horários de Quartas (09 e 10/07) são estimativas — confirmar no Admin.
const ko = (id, rodada, date, time, slotH, slotA)=>(
  { id, rodada, date, time, home:null, away:null, slotH, slotA, realH:null, realA:null, finished:false }
);
const KNOCKOUT_MATCHES = [
  // ----- 16-AVOS (Round of 32) — 28/06 a 03/07 -----
  ko("k-73","16-avos","2026-06-28","16:00","2º Grupo A","2º Grupo B"),
  ko("k-76","16-avos","2026-06-29","14:00","1º Grupo C","2º Grupo F"),
  ko("k-74","16-avos","2026-06-29","17:30","1º Grupo E","3º A/B/C/D/F"),
  ko("k-75","16-avos","2026-06-29","22:00","1º Grupo F","2º Grupo C"),
  ko("k-78","16-avos","2026-06-30","14:00","2º Grupo E","2º Grupo I"),
  ko("k-77","16-avos","2026-06-30","18:00","1º Grupo I","3º C/D/F/G/H"),
  ko("k-79","16-avos","2026-06-30","22:00","1º Grupo A","3º C/E/F/H/I"),
  ko("k-80","16-avos","2026-07-01","13:00","1º Grupo L","3º E/H/I/J/K"),
  ko("k-82","16-avos","2026-07-01","17:00","1º Grupo G","3º A/E/H/I/J"),
  ko("k-81","16-avos","2026-07-01","21:00","1º Grupo D","3º B/E/F/I/J"),
  ko("k-84","16-avos","2026-07-02","16:00","1º Grupo H","2º Grupo J"),
  ko("k-83","16-avos","2026-07-02","20:00","2º Grupo K","2º Grupo L"),
  ko("k-85","16-avos","2026-07-03","00:00","1º Grupo B","3º E/F/G/I/J"),
  ko("k-88","16-avos","2026-07-03","15:00","2º Grupo D","2º Grupo G"),
  ko("k-86","16-avos","2026-07-03","19:00","1º Grupo J","2º Grupo H"),
  ko("k-87","16-avos","2026-07-03","22:30","1º Grupo K","3º D/E/I/J/L"),
  // ----- OITAVAS (Round of 16) — 04 a 07/07 -----
  ko("k-90","Oitavas","2026-07-04","14:00","Venc. 73","Venc. 75"),
  ko("k-89","Oitavas","2026-07-04","18:00","Venc. 74","Venc. 77"),
  ko("k-91","Oitavas","2026-07-05","17:00","Venc. 76","Venc. 78"),
  ko("k-92","Oitavas","2026-07-05","21:00","Venc. 79","Venc. 80"),
  ko("k-93","Oitavas","2026-07-06","16:00","Venc. 83","Venc. 84"),
  ko("k-94","Oitavas","2026-07-06","21:00","Venc. 81","Venc. 82"),
  ko("k-95","Oitavas","2026-07-07","13:00","Venc. 86","Venc. 88"),
  ko("k-96","Oitavas","2026-07-07","17:00","Venc. 85","Venc. 87"),
  // ----- QUARTAS — 09 a 11/07 (horários de 09 e 10/07 a confirmar) -----
  ko("k-97","Quartas","2026-07-09","16:00","Venc. 89","Venc. 90"),
  ko("k-98","Quartas","2026-07-10","17:00","Venc. 93","Venc. 94"),
  ko("k-99","Quartas","2026-07-11","18:00","Venc. 91","Venc. 92"),
  ko("k-100","Quartas","2026-07-11","22:00","Venc. 95","Venc. 96"),
  // ----- SEMIFINAL — 14 e 15/07 -----
  ko("k-101","Semifinal","2026-07-14","16:00","Venc. 97","Venc. 98"),
  ko("k-102","Semifinal","2026-07-15","16:00","Venc. 99","Venc. 100"),
  // ----- 3º LUGAR — 18/07 -----
  ko("k-103","3º lugar","2026-07-18","18:00","Perdedor SF 1","Perdedor SF 2"),
  // ----- FINAL — 19/07 -----
  ko("k-104","Final","2026-07-19","16:00","Vencedor SF 1","Vencedor SF 2"),
];

const ADMIN_PIN = "chalana26";
// Usuários com acesso ao painel Admin (item 6). Comparação por nome normalizado.
const ADMIN_USERS = ["tiarles","diego paz"];

// Apostadores pré-cadastrados (tabela enviada). O badge "VOCÊ" aparece para quem estiver logado.
// base = pontuação acumulada até Suíça × Bósnia (saldo inicial). seedRank = ordem de desempate da tabela.
const SEED_PLAYERS = [
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
const SEED_VERSION = 4;

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
const K_KOVER = "chalanas:koseed";   // migração: acrescenta os jogos do mata-mata
const K_ME = "chalanas:me:v1"; // pessoal (por dispositivo)

/* ---------- utilidades ---------- */
const norm = (s)=> (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g,"").trim();
// apostadores removidos do bolão (comparação por nome normalizado)
const REMOVED_PLAYERS = new Set(["brunodopivo","matheus","vitor coelho"]);
const ALIAS = { "holanda":"paises baixos","eua":"estados unidos","usa":"estados unidos","czechia":"republica tcheca","south korea":"coreia do sul","fmt":"" };
const teamKey = (t)=>{ let n=norm(t); return ALIAS[n]||n; };
const kickoffMs = (m)=> new Date(iso(m.date,m.time)).getTime();
const fmtPts = (n)=>{ const v=Math.round(n*10)/10; return (v%1===0? String(v): v.toFixed(1)).replace(".",","); };
const WD = ["dom","seg","ter","qua","qui","sex","sáb"];
function dateLabel(d){ const dt=new Date(d+"T12:00:00-03:00"); return `${WD[dt.getDay()]} · ${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}`; }
const ROUND_ORDER = (r)=>{ const map={"1ª rodada":1,"2ª rodada":2,"3ª rodada":3,"16-avos":4,"Oitavas":5,"Quartas":6,"Semifinal":7,"3º lugar":8,"Final":9}; return map[r] ?? 99; };
// rótulo curto da aba por rodada
const ROUND_LABEL = (r)=>({ "1ª rodada":"Grupos · Rod. 1","2ª rodada":"Grupos · Rod. 2","3ª rodada":"Grupos · Rod. 3" }[r] || r);
const isGroupRound = (r)=> r==="1ª rodada"||r==="2ª rodada"||r==="3ª rodada";
// times definidos? (no mata-mata, home/away ficam null até o organizador definir)
const teamsSet = (m)=> !!m.home && !!m.away;
const sideName = (m,side)=> side==="h" ? (m.home || m.slotH || "A definir") : (m.away || m.slotA || "A definir");
const sideFlag = (m,side)=>{ const t = side==="h"? m.home : m.away; return t ? flag(t) : "⬢"; };
const matchLabel = (m)=> `${sideName(m,"h")} × ${sideName(m,"a")}`;

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
  const [tab,setTab] = useState("ranking");
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

  // roda uma vez: garante tabela, acrescenta o mata-mata e cadastra os apostadores
  const ensureSeed = useCallback(async ()=>{
    let ms = await getJSON(K_MATCHES,true,null);
    if(!ms){ ms = SEED_MATCHES.slice(); await setJSON(K_MATCHES, ms, true); }

    // migração incremental: acrescenta os jogos do mata-mata se ainda não existirem
    // (não mexe nos jogos de grupo nem em resultados/placares já lançados)
    const koVer = await sGet(K_KOVER, true);
    if(koVer == null){
      let cur = await getJSON(K_MATCHES,true,[]) || [];
      const have = new Set(cur.map(m=>m.id));
      let added = false;
      for(const km of KNOCKOUT_MATCHES){ if(!have.has(km.id)){ cur.push({...km}); added = true; } }
      if(added) await setJSON(K_MATCHES, cur, true);
      await sSet(K_KOVER, "1", true);
    }

    let ps = await getJSON(K_PLAYERS,true,null);
    if(!ps){ await setJSON(K_PLAYERS, SEED_PLAYERS.slice(), true); }
    else {
      const have = new Set(ps.map(p=>norm(p.name)));
      let added = false;
      for(const sp of SEED_PLAYERS){ if(!have.has(norm(sp.name))){ ps.push({...sp}); added=true; } }
      if(added) await setJSON(K_PLAYERS, ps, true);
    }

    // remoção definitiva de apostadores que saíram do bolão (limpa a lista viva no Supabase)
    {
      let pl = await getJSON(K_PLAYERS,true,[]) || [];
      if(pl.some(p=>REMOVED_PLAYERS.has(norm(p.name)))){
        pl = pl.filter(p=>!REMOVED_PLAYERS.has(norm(p.name)));
        await setJSON(K_PLAYERS, pl, true);
      }
    }

    // migração: aplica pontuação-base, ordem de desempate e TIME PREFERIDO (oficial/fixo) aos jogadores já cadastrados
    const ver = await sGet(K_SEEDVER, true);
    if(ver !== String(SEED_VERSION)){
      let cur = await getJSON(K_PLAYERS,true,[]) || [];
      cur = cur.map(p=>{
        const sp = SEED_PLAYERS.find(s=> s.id===p.id) || SEED_PLAYERS.find(s=> norm(s.name)===norm(p.name));
        return sp ? { ...p, base: sp.base, seedRank: sp.seedRank, favTeam: sp.favTeam } : p;
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
    if(REMOVED_PLAYERS.has(norm(name))){ showToast("Esse apostador foi removido do bolão."); return; }
    const ps = await getJSON(K_PLAYERS,true,[]) || [];
    let p = ps.find(x=> norm(x.name)===norm(name));
    if(p){ /* time preferido fixo: re-login não altera mais o favTeam */ }
    else { p = { id:"p-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:name.trim(), favTeam:fav, createdAt:Date.now() }; ps.push(p); await setJSON(K_PLAYERS, ps, true); }
    await sSet(K_ME, p.id, false);
    setMeId(p.id);
    await refresh();
    showToast(`Bora, ${p.name.split(" ")[0]}! Boa sorte ⚽`);
  },[refresh,showToast]);

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
  const saveBetFor = useCallback(async (pid, matchId, h, a)=>{
    const cur = await getJSON(K_BET(pid),true,{}) || {};
    if(h===""||a===""||h==null||a==null){ delete cur[matchId]; }
    else { cur[matchId] = { h:Math.max(0,Math.min(19,parseInt(h,10)||0)), a:Math.max(0,Math.min(19,parseInt(a,10)||0)) }; }
    await setJSON(K_BET(pid), cur, true);
    setBets(prev=>({ ...prev, [pid]: cur }));
  },[]);
  const saveMatches = useCallback(async (ms)=>{ setMatches(ms); await setJSON(K_MATCHES, ms, true); },[]);
  const saveSettings = useCallback(async (st)=>{ setSettings(st); await setJSON(K_SETTINGS, st, true); },[]);
  // admin: salvar jogadores (usado pelo ajuste manual de pontos)
  const savePlayers = useCallback(async (ps)=>{ setPlayers(ps); await setJSON(K_PLAYERS, ps, true); },[]);

  /* ----- rankings ----- */
  const totals = useMemo(()=>{
    return players.map(p=>{
      let computed=0; const perMatch={};
      for(const m of matches){
        const r = scoreMatch(bets[p.id]?.[m.id], m, p.favTeam);
        computed += r.pts; perMatch[m.id]=r;
      }
      const adj = Number(p.adj) || 0;        // ajuste manual do organizador
      const total = (p.base||0) + computed + adj;
      return { ...p, adj, computed, total, perMatch };
    }).sort((a,b)=> b.total-a.total || (a.seedRank??999)-(b.seedRank??999) || a.name.localeCompare(b.name,"pt"));
  },[players,matches,bets]);

  const finishedSorted = useMemo(()=> matches.filter(m=>m.finished).sort((a,b)=> kickoffMs(b)-kickoffMs(a)), [matches]);
  const last4 = finishedSorted.slice(0,4);

  if(!loaded) return <Splash/>;

  const isAdminUser = !!me && ADMIN_USERS.includes(norm(me.name));
  const safeTab = (tab==="admin" && !isAdminUser) ? "ranking" : tab;

  return (
    <div className="cb-root">
      <StyleTag/>
      <Pitch/>
      <div className="cb-shell">
        <Header me={me} totals={totals}/>
        {!me ? (
          <Onboarding onLogin={login}/>
        ) : (
          <>
            <Nav tab={safeTab} setTab={setTab} isAdminUser={isAdminUser}/>
            {safeTab==="ranking" && (
              <RankingTab totals={totals} matches={matches} last4={last4} bets={bets}/>
            )}
            {safeTab==="jogos" && (
              <JogosTab matches={matches} players={players} bets={bets} me={me} now={now}
                        settings={settings} onSaveBet={saveBet}/>
            )}
            {safeTab==="regras" && <RegrasTab/>}
            {safeTab==="admin" && isAdminUser && (
              <AdminTab matches={matches} settings={settings} players={players} bets={bets}
                        onSaveMatches={saveMatches} onSaveBetFor={saveBetFor} onSavePlayers={savePlayers}
                        onSaveSettings={saveSettings} showToast={showToast}/>
            )}
          </>
        )}
        <footer className="cb-foot">Chalana's Bet · Bolão Copa 2026 — horários em Brasília (BRT) · <span style={{opacity:.65}}>build v11</span></footer>
      </div>
      {toast && <div className="cb-toast">{toast}</div>}
    </div>
  );
}

/* ============================ COMPONENTES ============================ */

function Splash(){ return (<div className="cb-root"><StyleTag/><div className="cb-splash"><span className="cb-ball"><img className="cb-ball-img" src="/cabeca-chalanas.png" alt="" onError={(e)=>{ const s=e.currentTarget.parentNode; if(s) s.textContent="⚽"; }}/></span><b>CHALANA'S BET</b></div></div>); }

function Header({me,totals}){
  const myRank = me ? totals.findIndex(t=>t.id===me.id)+1 : 0;
  return (
    <header className="cb-header">
      <div className="cb-brand">
        <div className="cb-shield">
          <img className="cb-logo-img" src="/logo-chalanas.png" alt="Chalana's Bet"
               onError={(e)=>{ e.currentTarget.style.display="none"; }}/>
        </div>
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
        <p className="cb-onb-note">Atenção: depois de entrar, o nome fica <b>fixo neste aparelho</b> — confira antes de confirmar.</p>
      </div>
    </div>
  );
}

function Nav({tab,setTab,isAdminUser}){
  const items = [["ranking","Ranking",Trophy],["jogos","Jogos",Calendar],["regras","Regras",Shield]];
  if(isAdminUser) items.push(["admin","Admin",Settings]);
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
function RoundTabs({rounds,sel,setSel}){
  return (
    <div className="cb-rtabs">
      {rounds.map(r=>(
        <button key={r} className={"cb-rtab"+(r===sel?" cb-rtab-on":"")} onClick={()=>setSel(r)}>
          {ROUND_LABEL(r)}
        </button>
      ))}
    </div>
  );
}

function JogosTab({matches,players,bets,me,now,settings,onSaveBet}){
  // rodadas presentes, na ordem oficial
  const rounds = useMemo(()=>[...new Set(matches.map(m=>m.rodada))]
    .sort((a,b)=>ROUND_ORDER(a)-ROUND_ORDER(b)),[matches]);

  // rodada inicial: a primeira que ainda tem jogo por acontecer (senão a última)
  const firstOpen = useMemo(()=>{
    for(const r of rounds){ if(matches.some(m=>m.rodada===r && !m.finished)) return r; }
    return rounds[rounds.length-1];
  },[rounds,matches]);

  const [sel,setSel] = useState(null);
  useEffect(()=>{ if(sel==null && firstOpen) setSel(firstOpen); },[firstOpen,sel]);
  const cur = sel || firstOpen;

  // jogos da rodada selecionada, agrupados por data
  const days = useMemo(()=>{
    const ms = matches.filter(m=>m.rodada===cur)
      .sort((a,b)=> kickoffMs(a)-kickoffMs(b));
    const byD = {};
    ms.forEach(m=>{ (byD[m.date]=byD[m.date]||[]).push(m); });
    return Object.entries(byD).sort((a,b)=>a[0].localeCompare(b[0]));
  },[matches,cur]);

  return (
    <div className="cb-page">
      <RoundTabs rounds={rounds} sel={cur} setSel={setSel}/>
      <section className="cb-round">
        <div className="cb-round-head">
          <span className="cb-round-tag">{isGroupRound(cur)?"Fase de grupos":"Mata-mata"}</span>
          <h3>{ROUND_LABEL(cur)}</h3>
        </div>
        {days.length===0
          ? <div className="cb-empty">Nenhum jogo nesta rodada.</div>
          : days.map(([date,ms])=>(
              <div key={date} className="cb-day">
                <div className="cb-day-label"><Calendar size={13}/> {dateLabel(date)}</div>
                <div className="cb-matches">
                  {ms.map(m=> <MatchCard key={m.id} m={m} players={players} bets={bets} me={me} now={now} settings={settings} onSaveBet={onSaveBet}/>)}
                </div>
              </div>
            ))}
      </section>
    </div>
  );
}

function MatchCard({m,players,bets,me,now,settings,onSaveBet}){
  const [open,setOpen] = useState(false);
  const kMs = kickoffMs(m);
  const lockMin = m.lockMin ?? 10;
  const lockMs = kMs - lockMin*60*1000;
  const locked = now >= lockMs;
  const defined = teamsSet(m);              // confronto definido?
  const mine = bets[me.id]?.[m.id];
  const [h,setH] = useState(mine?.h ?? "");
  const [a,setA] = useState(mine?.a ?? "");
  useEffect(()=>{ setH(mine?.h ?? ""); setA(mine?.a ?? ""); },[mine?.h,mine?.a]);

  const dirty = String(h)!==String(mine?.h ?? "") || String(a)!==String(mine?.a ?? "");
  const editable = defined && !m.finished && !locked;
  const betCount = players.filter(p=> bets[p.id]?.[m.id]).length;
  const revealOthers = m.finished || locked || settings.revealBeforeLock;

  let status, statusClass;
  if(m.finished){ status="Encerrado"; statusClass="cb-st-done"; }
  else if(!defined){ status="A definir"; statusClass="cb-st-tbd"; }
  else if(locked){ status="Palpites fechados"; statusClass="cb-st-lock"; }
  else status = "Fecha em " + timeLeft(lockMs-now);

  return (
    <div className={"cb-match"+(m.finished?" cb-match-done":"")+(!defined?" cb-match-tbd":"")}>
      <div className="cb-match-top">
        <span className="cb-time">{m.time}</span>
        <div className="cb-top-right">
          {!m.finished && defined && lockMin!==10 && (
            <span className="cb-window" title="Janela de palpites antes do jogo">trava {lockMin>=60?`${lockMin/60}h`:`${lockMin}min`} antes</span>
          )}
          <span className={"cb-status "+(statusClass||"cb-st-open")}>
            {(!m.finished && defined && locked) && <Lock size={11}/>}{status}
          </span>
        </div>
      </div>

      {/* placar estilo painel */}
      <div className="cb-score">
        <div className="cb-team cb-team-h">
          <span className="cb-flag">{sideFlag(m,"h")}</span>
          <span className={"cb-tname"+(m.home?"":" cb-tname-tbd")}>{sideName(m,"h")}</span>
        </div>
        <div className="cb-score-box">
          {m.finished
            ? <><b>{m.realH}</b><i>×</i><b>{m.realA}</b></>
            : <><b className="cb-vs">VS</b></>}
        </div>
        <div className="cb-team cb-team-a">
          <span className={"cb-tname"+(m.away?"":" cb-tname-tbd")}>{sideName(m,"a")}</span>
          <span className="cb-flag">{sideFlag(m,"a")}</span>
        </div>
      </div>

      {/* confronto ainda não definido */}
      {!m.finished && !defined && (
        <div className="cb-tbdnote">Confronto definido após a fase de grupos. Os palpites abrem quando os times forem confirmados.</div>
      )}

      {/* meu palpite */}
      {!m.finished && defined && (
        <div className="cb-betrow">
          <span className="cb-betlabel">Seu palpite</span>
          <div className="cb-betinputs">
            <input className="cb-pick" type="number" min="0" max="19" inputMode="numeric"
                   disabled={!editable} value={h} onChange={e=>setH(e.target.value)} aria-label={`gols ${sideName(m,"h")}`}/>
            <span className="cb-x">×</span>
            <input className="cb-pick" type="number" min="0" max="19" inputMode="numeric"
                   disabled={!editable} value={a} onChange={e=>setA(e.target.value)} aria-label={`gols ${sideName(m,"a")}`}/>
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
      <span className="cb-mr-bet">Seu palpite: <b>{bet.h}×{bet.a}</b></span>
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
                  <span className="cb-rank-pos">{i+1}</span>
                  <div className="cb-row-main">
                    <span className="cb-row-name">{flag(p.favTeam)} {p.name}</span>
                    <span className="cb-row-fav">{p.favTeam}{p.base?` · base ${fmtPts(p.base)}`:""}{p.computed?` · rodadas ${p.computed>0?"+":""}${fmtPts(p.computed)}`:""}{p.adj?` · ajuste ${p.adj>0?"+":""}${fmtPts(p.adj)}`:""}</span>
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
          Os palpites travam <b>10 minutos antes</b> de cada jogo. Nos jogos de mata-mata, o palpite só abre depois que os times são confirmados.
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- ADMIN: LANÇAR PALPITES ---------------------------- */
function AdminBets({matches,players,bets,onSaveBetFor,showToast}){
  const ordered = useMemo(()=> [...matches].sort((a,b)=> ROUND_ORDER(a.rodada)-ROUND_ORDER(b.rodada) || kickoffMs(a)-kickoffMs(b)), [matches]);
  const [mid,setMid] = useState("");
  const [vals,setVals] = useState({});
  const [saving,setSaving] = useState(false);

  useEffect(()=>{ if(!mid && ordered.length){ const n = ordered.find(m=>!m.finished) || ordered[0]; setMid(n.id); } },[ordered,mid]);

  // ao trocar de jogo, carrega os palpites já existentes
  useEffect(()=>{
    if(!mid) return;
    const v = {};
    players.forEach(p=>{ const b=bets[p.id]?.[mid]; v[p.id] = { h: b? String(b.h):"", a: b? String(b.a):"" }; });
    setVals(v);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mid, players.length]);

  const setV = (pid, side, value)=> setVals(s=> ({...s, [pid]: {...(s[pid]||{h:"",a:""}), [side]: value}}));
  const m = ordered.find(x=>x.id===mid);

  async function salvar(){
    if(!mid) return;
    setSaving(true);
    let n=0;
    for(const p of players){
      const v = vals[p.id] || {h:"",a:""};
      const cur = bets[p.id]?.[mid];
      const curH = cur? String(cur.h):"", curA = cur? String(cur.a):"";
      if(String(v.h)!==curH || String(v.a)!==curA){ await onSaveBetFor(p.id, mid, v.h, v.a); n++; }
    }
    setSaving(false);
    showToast(n>0 ? `${n} palpite(s) salvo(s)` : "Nada mudou");
  }

  return (
    <section className="cb-block">
      <h3 className="cb-block-title"><Users size={15}/> Lançar palpites (organizador)</h3>
      <p className="cb-admin-p">Escolha o jogo e digite o placar de cada jogador. Em branco = sem palpite. Útil para subir palpites feitos fora do app.</p>
      <div className="cb-select-wrap cb-be-select">
        <select className="cb-select" value={mid} onChange={e=>setMid(e.target.value)}>
          {ordered.map(x=> <option key={x.id} value={x.id}>{matchLabel(x)} — {dateLabel(x.date)} {x.time}{x.finished?" ✓":""}</option>)}
        </select>
        <ChevronDown size={16} className="cb-select-caret"/>
      </div>
      {m && <div className="cb-be-head">{sideFlag(m,"h")} {sideName(m,"h")} <b>×</b> {sideName(m,"a")} {sideFlag(m,"a")}</div>}
      <div className="cb-betentry">
        {players.map(p=>(
          <div key={p.id} className="cb-be-row">
            <span className="cb-be-name">{flag(p.favTeam)} {p.name}</span>
            <div className="cb-be-inputs">
              <input className="cb-pick" type="number" min="0" max="19" inputMode="numeric" value={vals[p.id]?.h ?? ""} onChange={e=>setV(p.id,"h",e.target.value)} aria-label={`gols ${m?m.home:""} ${p.name}`}/>
              <span className="cb-x">×</span>
              <input className="cb-pick" type="number" min="0" max="19" inputMode="numeric" value={vals[p.id]?.a ?? ""} onChange={e=>setV(p.id,"a",e.target.value)} aria-label={`gols ${m?m.away:""} ${p.name}`}/>
            </div>
          </div>
        ))}
      </div>
      <button className="cb-btn cb-btn-primary cb-btn-block" disabled={saving} onClick={salvar}>
        <Check size={15}/> {saving ? "Salvando…" : "Salvar palpites deste jogo"}
      </button>
    </section>
  );
}

/* ---------------------------- ADMIN: AJUSTE MANUAL DE PONTOS ---------------------------- */
function AdminAdjust({players,onSavePlayers,showToast}){
  const ordered = useMemo(()=> [...players].sort((a,b)=> (a.seedRank??999)-(b.seedRank??999) || a.name.localeCompare(b.name,"pt")), [players]);
  const [vals,setVals] = useState(()=>{ const v={}; players.forEach(p=>{ v[p.id]=String(p.adj ?? ""); }); return v; });
  const [saving,setSaving] = useState(false);

  useEffect(()=>{ setVals(v=>{ const nv={...v}; players.forEach(p=>{ if(nv[p.id]===undefined) nv[p.id]=String(p.adj ?? ""); }); return nv; }); },[players]);

  async function salvar(){
    setSaving(true);
    const next = players.map(p=>{
      const raw = (vals[p.id] ?? "").toString().replace(",", ".").trim();
      const adj = raw==="" ? 0 : (Number(raw) || 0);
      return { ...p, adj };
    });
    await onSavePlayers(next);
    setSaving(false);
    showToast("Ajustes salvos");
  }

  return (
    <section className="cb-block">
      <h3 className="cb-block-title"><Sliders size={15}/> Ajuste manual de pontos</h3>
      <p className="cb-admin-p">Correção em cima do total calculado. Use valores com sinal (ex.: <b>2</b>, <b>-1,5</b>). Em branco = 0. Não substitui a pontuação automática — soma/subtrai por cima dela.</p>
      <div className="cb-betentry">
        {ordered.map(p=>(
          <div key={p.id} className="cb-be-row">
            <span className="cb-be-name">{flag(p.favTeam)} {p.name}</span>
            <input className="cb-input cb-adj-input" inputMode="decimal" placeholder="0"
                   value={vals[p.id] ?? ""} onChange={e=>setVals(v=>({...v,[p.id]:e.target.value}))}/>
          </div>
        ))}
      </div>
      <button className="cb-btn cb-btn-primary cb-btn-block" disabled={saving} onClick={salvar}>
        <Check size={15}/> {saving ? "Salvando…" : "Salvar ajustes"}
      </button>
    </section>
  );
}

/* ---------------------------- ADMIN ---------------------------- */
function AdminTab({matches,settings,players,bets,onSaveMatches,onSaveBetFor,onSavePlayers,onSaveSettings,showToast}){
  const [pin,setPin] = useState("");
  const [ok,setOk] = useState(false);
  const [draft,setDraft] = useState(matches);
  const [iaStatus,setIaStatus] = useState(null);
  const [arRound,setArRound] = useState(null);   // filtro de rodada na lista de jogos
  // draft é inicializado uma vez (useState). Não re-sincroniza no refresh para não apagar edições.

  const draftRounds = useMemo(()=>[...new Set(draft.map(m=>m.rodada))].sort((a,b)=>ROUND_ORDER(a)-ROUND_ORDER(b)),[draft]);
  useEffect(()=>{ if(arRound==null && draftRounds.length) setArRound(draftRounds[0]); },[draftRounds,arRound]);

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

  const curRound = arRound || draftRounds[0];
  const upd = (id,patch)=> setDraft(d=> d.map(m=> m.id===id? {...m,...patch}: m));
  const addMatch = ()=> setDraft(d=> [...d, { id:"m-"+Date.now().toString(36), rodada:curRound||"2ª rodada", date:"2026-06-22", time:"16:00", home:null, away:null, slotH:"", slotA:"", lockMin:10, realH:null, realA:null, finished:false }]);
  const del = (id)=> setDraft(d=> d.filter(m=> m.id!==id));
  const save = ()=>{ onSaveMatches(draft); showToast("Tabela salva para todos"); };

  async function atualizarIA(){
    setIaStatus("Buscando dados oficiais (datas, horários e placares)…");
    try{
      const res = await fetch("/api/atualizar", { method:"POST", headers:{"Content-Type":"application/json"} });
      const data = await res.json();
      if(data.error){ setIaStatus("Erro: "+data.error); return; }
      const arr = Array.isArray(data.matches) ? data.matches : [];
      let matched=0, changed=0;
      const next = draft.map(m=>{
        if(!teamsSet(m)) return m;
        const hit = arr.find(r=> (teamKey(r.home)===teamKey(m.home) && teamKey(r.away)===teamKey(m.away))
                              || (teamKey(r.home)===teamKey(m.away) && teamKey(r.away)===teamKey(m.home)));
        if(!hit) return m;
        matched++;
        const swap = teamKey(hit.home)===teamKey(m.away);
        const nm = {...m};
        if(typeof hit.date==="string" && /^\d{4}-\d{2}-\d{2}$/.test(hit.date)) nm.date=hit.date;
        if(typeof hit.time==="string" && /^\d{1,2}:\d{2}$/.test(hit.time)) nm.time=hit.time.padStart(5,"0");
        if(hit.homeScore!=null && hit.awayScore!=null){
          const nh = swap?hit.awayScore:hit.homeScore;
          const na = swap?hit.homeScore:hit.awayScore;
          if(nm.realH!==nh || nm.realA!==na || !nm.finished) changed++;
          nm.realH=nh; nm.realA=na; nm.finished=true;
        }
        return nm;
      });
      setDraft(next); onSaveMatches(next);
      const fonte = (data.checked!=null)?data.checked:arr.length;
      setIaStatus(
        changed>0
          ? `✓ ${changed} placar(es) novo(s). Fonte: ${fonte} encerrado(s), ${matched} casaram com a tabela.`
          : `Nada novo. Fonte: ${fonte} jogo(s) encerrado(s), ${matched} casaram — todos já lançados. Se um jogo que já acabou não casou: ou ainda não está "encerrado" na fonte, ou os times dele não estão definidos/salvos na tabela.`
      );
    }catch(e){
      setIaStatus("Não consegui buscar agora. Ajuste datas, horários e placares manualmente abaixo.");
    }
  }

  const draftFiltered = draft.filter(m=>m.rodada===curRound).sort((a,b)=>kickoffMs(a)-kickoffMs(b));

  return (
    <div className="cb-page">
      <section className="cb-block">
        <h3 className="cb-block-title"><RefreshCw size={15}/> Atualizar resultados</h3>
        <p className="cb-admin-p">Busca placares finais da Copa 2026 na web e preenche os jogos da tabela. É um apoio — confira sempre antes de salvar.</p>
        <div className="cb-admin-actions">
          <button className="cb-btn cb-btn-primary" onClick={atualizarIA}><RefreshCw size={14}/> Atualizar via IA</button>
        </div>
        {iaStatus && <div className="cb-iastatus">{iaStatus}</div>}
      </section>

      <AdminAdjust players={players} onSavePlayers={onSavePlayers} showToast={showToast}/>

      <AdminBets matches={matches} players={players} bets={bets} onSaveBetFor={onSaveBetFor} showToast={showToast}/>

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

        <RoundTabs rounds={draftRounds} sel={curRound} setSel={setArRound}/>

        <div className="cb-adminlist">
          {draftFiltered.map(m=>(
            <div key={m.id} className="cb-adminrow">
              {!teamsSet(m) && (m.slotH||m.slotA) && (
                <div className="cb-ar-slot">{m.slotH||"?"} <b>×</b> {m.slotA||"?"}</div>
              )}
              <div className="cb-ar-line">
                <input className="cb-input cb-ar-round" value={m.rodada} onChange={e=>upd(m.id,{rodada:e.target.value})}/>
                <input className="cb-input cb-ar-date" type="date" value={m.date} onChange={e=>upd(m.id,{date:e.target.value})}/>
                <input className="cb-input cb-ar-time" type="time" value={m.time} onChange={e=>upd(m.id,{time:e.target.value})}/>
                <input className="cb-input cb-ar-lock" type="number" min="0" title="Trava: minutos antes do jogo" value={m.lockMin??10} onChange={e=>upd(m.id,{lockMin:e.target.value===""?10:parseInt(e.target.value,10)})}/>
                <span className="cb-ar-locku">min</span>
                <button className="cb-icon-btn cb-del" onClick={()=>del(m.id)}><X size={14}/></button>
              </div>
              <div className="cb-ar-line">
                <select className="cb-select cb-ar-team" value={m.home||""} onChange={e=>upd(m.id,{home:e.target.value||null})}>
                  <option value="">— a definir —</option>
                  {FAV_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <input className="cb-pick cb-ar-sc" type="number" min="0" placeholder="-" value={m.realH??""} onChange={e=>upd(m.id,{realH:e.target.value===""?null:parseInt(e.target.value,10)})}/>
                <span className="cb-x">×</span>
                <input className="cb-pick cb-ar-sc" type="number" min="0" placeholder="-" value={m.realA??""} onChange={e=>upd(m.id,{realA:e.target.value===""?null:parseInt(e.target.value,10)})}/>
                <select className="cb-select cb-ar-team" value={m.away||""} onChange={e=>upd(m.id,{away:e.target.value||null})}>
                  <option value="">— a definir —</option>
                  {FAV_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
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
.cb-shield{position:relative;width:42px;height:42px;display:grid;place-items:center;border-radius:11px;overflow:hidden;
  background:linear-gradient(150deg,var(--amarelo),var(--amarelo2));color:var(--azul2);
  box-shadow:0 6px 18px rgba(0,0,0,.35),inset 0 0 0 2px rgba(255,255,255,.4);}
.cb-logo-img{width:100%;height:100%;object-fit:cover;display:block;}
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

/* abas de rodada (pills) */
.cb-rtabs{display:flex;gap:7px;overflow-x:auto;padding:2px 2px 6px;margin-bottom:4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.cb-rtabs::-webkit-scrollbar{display:none;}
.cb-rtab{flex:0 0 auto;white-space:nowrap;border:1px solid var(--line);background:var(--panel);color:var(--muted);
  font-family:'Inter';font-weight:600;font-size:12.5px;padding:8px 14px;border-radius:999px;cursor:pointer;transition:.15s;}
.cb-rtab:hover{color:var(--branco);border-color:rgba(255,255,255,.25);}
.cb-rtab-on{background:linear-gradient(180deg,var(--verde),var(--verde2));color:#fff;border-color:transparent;
  box-shadow:0 4px 12px rgba(10,166,74,.35);}

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
.cb-match{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;min-width:0;}
.cb-match-done{background:linear-gradient(180deg,var(--panel2),var(--panel));border-color:rgba(255,210,0,.18);}
.cb-match-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
.cb-top-right{display:flex;align-items:center;gap:7px;}
.cb-window{font-size:10px;font-weight:600;color:#ffd9a8;background:rgba(255,150,0,.12);padding:3px 7px;border-radius:20px;}
.cb-time{font-family:'Oswald';font-weight:600;font-size:14px;color:var(--branco);}
.cb-status{font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;}
.cb-st-open{color:#bfe9cf;background:rgba(52,210,123,.12);}
.cb-st-lock{color:#ffd9a8;background:rgba(255,150,0,.14);}
.cb-st-done{color:var(--azul2);background:var(--amarelo);}
.cb-st-tbd{color:#bcd0ff;background:rgba(120,150,255,.14);}
.cb-match-tbd{opacity:.96;border-style:dashed;}
.cb-tname-tbd{color:var(--muted);font-weight:600;font-size:12px;font-style:italic;}
.cb-tbdnote{border-top:1px solid var(--line);padding-top:9px;margin-top:2px;font-size:11.5px;color:var(--muted);line-height:1.45;}

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
.cb-betrow{display:flex;align-items:center;justify-content:space-between;gap:8px 10px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:10px;}
.cb-betlabel{font-size:11.5px;font-weight:600;color:var(--muted);flex:0 0 auto;white-space:nowrap;text-transform:uppercase;letter-spacing:.4px;}
.cb-betinputs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end;margin-left:auto;}
.cb-pick{width:42px;height:38px;text-align:center;background:#0a1c12;border:1px solid var(--line);border-radius:9px;
  color:var(--branco);font-family:'Oswald';font-size:18px;font-weight:600;outline:none;-moz-appearance:textfield;}
.cb-pick::-webkit-outer-spin-button,.cb-pick::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.cb-pick:focus{border-color:var(--amarelo);}
.cb-pick:disabled{opacity:.55;}
.cb-x{color:var(--muted);font-weight:600;}
.cb-locktag{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:var(--muted);
  font-family:'Oswald';}

/* my result */
.cb-myresult{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;border-top:1px solid var(--line);padding-top:10px;font-size:12.5px;line-height:1.45;width:100%;}
.cb-myresult b{font-family:'Oswald';white-space:nowrap;}
.cb-mr-bet{white-space:nowrap;flex:0 1 auto;}
.cb-mr-pts{margin-left:auto;font-family:'Oswald';font-weight:700;font-size:15px;white-space:nowrap;flex:0 0 auto;}
.cb-pos .cb-mr-pts,.cb-pos{color:var(--pos);}
.cb-neg .cb-mr-pts,.cb-neg{color:var(--neg);}
.cb-myresult.cb-pos{color:var(--branco);} .cb-myresult.cb-neg{color:var(--branco);}
.cb-mr-reason{flex-basis:100%;color:var(--muted);font-size:11.5px;white-space:normal;}
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
.cb-rank-pos{font-family:'Oswald';font-weight:700;font-size:17px;width:30px;height:30px;display:grid;place-items:center;
  border-radius:50%;background:rgba(255,255,255,.06);color:var(--muted);flex:none;}
.cb-row-top .cb-rank-pos{color:var(--azul2);}
.cb-row-1 .cb-rank-pos{background:linear-gradient(150deg,#ffe14d,#f4b400);}
.cb-row-2 .cb-rank-pos{background:linear-gradient(150deg,#e6e6e6,#b9b9b9);}
.cb-row-3 .cb-rank-pos{background:linear-gradient(150deg,#e8a86b,#c47b3d);}
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
.cb-ar-slot{font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:7px;padding-bottom:6px;border-bottom:1px dashed var(--line);}
.cb-ar-slot b{color:var(--amarelo);font-family:'Oswald';}
.cb-adj-input{width:84px;flex:none;text-align:center;font-family:'Oswald';font-weight:600;font-size:16px;padding:8px;}
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
.cb-be-select{margin-bottom:12px;}
.cb-be-head{display:flex;align-items:center;gap:7px;justify-content:center;font-family:'Oswald';font-weight:600;font-size:15px;background:#0a1c12;border:1px solid var(--line);border-radius:10px;padding:9px;margin-bottom:10px;}
.cb-be-head b{color:var(--muted);}
.cb-betentry{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
.cb-be-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#0a1c12;border:1px solid var(--line);border-radius:10px;padding:7px 11px;}
.cb-be-name{font-weight:600;font-size:13px;}
.cb-be-inputs{display:flex;align-items:center;gap:6px;flex:none;}
.cb-be-inputs .cb-pick{width:40px;height:34px;font-size:16px;}

/* misc */
.cb-foot{text-align:center;font-size:11px;color:var(--muted);margin-top:24px;}
.cb-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:50;background:var(--azul2);
  color:#fff;font-weight:600;font-size:13px;padding:11px 18px;border-radius:11px;box-shadow:0 10px 30px rgba(0,0,0,.5);
  border:1px solid rgba(255,255,255,.15);}
.cb-splash{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:14px;
  font-family:'Oswald';font-size:20px;letter-spacing:1px;color:var(--branco);}
.cb-ball{font-size:40px;animation:spin 1.4s linear infinite;display:inline-flex;}
.cb-ball-img{width:84px;height:84px;object-fit:contain;display:block;}
@keyframes spin{to{transform:rotate(360deg);}}

@media(max-width:540px){
  .cb-brand h1{font-size:20px;} .cb-tab span{display:none;} .cb-tab{padding:10px;}
  .cb-results{grid-template-columns:1fr;}
  .cb-ar-line{flex-wrap:wrap;} .cb-ar-date,.cb-ar-time{width:auto;flex:1;}
  .cb-me{padding:6px 10px;} .cb-me-name{font-size:12px;} .cb-me-fav{font-size:10px;}
}
@media(prefers-reduced-motion:reduce){.cb-ball{animation:none;}}
`}</style>;
}
