import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anon ? createClient(url, anon) : null;

if (!supabase) {
  console.warn(
    "[Chalana's Bet] Supabase não configurado. Defina VITE_SUPABASE_URL e " +
      "VITE_SUPABASE_ANON_KEY no .env (local) e nas Environment Variables do Vercel. " +
      "Sem isso, os dados ficam só na memória deste navegador."
  );
}

// fallback em memória (só para não quebrar a tela se faltar configuração)
const mem = {};

/* shared=true  -> tabela "kv" do Supabase (compartilhado entre todos os amigos)
   shared=false -> localStorage (por dispositivo: quem você é neste aparelho) */

export async function sGet(key, shared = true) {
  if (!shared) {
    try { return localStorage.getItem(key); } catch { return key in mem ? mem[key] : null; }
  }
  if (!supabase) return key in mem ? mem[key] : null;
  try {
    const { data, error } = await supabase.from("kv").select("value").eq("key", key).maybeSingle();
    if (error) throw error;
    return data ? data.value : null;
  } catch (e) {
    console.error("sGet", key, e);
    return key in mem ? mem[key] : null;
  }
}

export async function sSet(key, val, shared = true) {
  if (!shared) {
    try { localStorage.setItem(key, val); } catch { mem[key] = val; }
    return;
  }
  mem[key] = val;
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("kv")
      .upsert({ key, value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
  } catch (e) {
    console.error("sSet", key, e);
  }
}

export async function sList(prefix, shared = true) {
  if (!shared) {
    try { return Object.keys(localStorage).filter((k) => k.startsWith(prefix)); }
    catch { return Object.keys(mem).filter((k) => k.startsWith(prefix)); }
  }
  if (!supabase) return Object.keys(mem).filter((k) => k.startsWith(prefix));
  try {
    const { data, error } = await supabase.from("kv").select("key").like("key", prefix + "%");
    if (error) throw error;
    return (data || []).map((r) => r.key);
  } catch (e) {
    console.error("sList", prefix, e);
    return [];
  }
}

export async function sDelete(key, shared = true) {
  if (!shared) { try { localStorage.removeItem(key); } catch { delete mem[key]; } return; }
  if (!supabase) { delete mem[key]; return; }
  try { await supabase.from("kv").delete().eq("key", key); } catch (e) { console.error("sDelete", key, e); }
}

/* ---------- HORA DO SERVIDOR (anti-trapaça de relógio) ----------
   Lê o header HTTP `Date` de uma resposta do Supabase. É a hora de um servidor
   real, que o usuário NÃO controla mexendo no relógio do próprio celular.
   Retorna epoch ms do servidor, ou null se não der (aí o app cai no relógio local). */
export async function serverNow() {
  if (!url) return null;
  try {
    // HEAD leve no endpoint REST; não precisa de tabela nem retorna linhas.
    const res = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: anon ? { apikey: anon } : {},
      cache: "no-store",
    });
    const d = res.headers.get("date");
    if (!d) return null;
    const ms = Date.parse(d);
    return Number.isFinite(ms) ? ms : null;
  } catch (e) {
    console.warn("serverNow", e);
    return null;
  }
}
