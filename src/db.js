// Camada de dados da Reforma da Casa.
//
// Com Supabase configurado (variáveis VITE_SUPABASE_URL e
// VITE_SUPABASE_PUBLISHABLE_KEY ou VITE_SUPABASE_ANON_KEY), tudo fica na
// tabela public.reforma_docs e as mudanças chegam ao vivo em todos os
// aparelhos. Sem Supabase, os dados ficam no localStorage deste navegador.
//
// A API imita a que o app já usava:
//   db.collection('itens').onSnapshot(fn) / .add(dados) / .doc(id)
//   db.doc('meta/app').set(dados) / .update(campos) / .delete() / .onSnapshot(fn)

import { createClient } from '@supabase/supabase-js';

const TABLE = 'reforma_docs';
const LOCAL_KEY = 'reforma-da-casa-db';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const store = new Map(); // colecao -> Map(id -> dados)
const colListeners = new Map(); // colecao -> Set(fn)
const docListeners = new Map(); // "colecao/id" -> Set(fn)
let loaded = false;
let loadError = null;

const colMap = c => { if (!store.has(c)) store.set(c, new Map()); return store.get(c); };
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(15)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('').slice(0, 20);

function colSnap(c) {
  const m = colMap(c);
  return { docs: [...m.entries()].sort(([a], [b]) => a < b ? -1 : 1).map(([id, d]) => ({ id, data: () => d })) };
}
const docSnap = (c, id) => ({ id, exists: colMap(c).has(id), data: () => colMap(c).get(id) });

function emit(c, id) {
  (colListeners.get(c) || []).forEach(fn => fn(colSnap(c)));
  if (id) (docListeners.get(c + '/' + id) || []).forEach(fn => fn(docSnap(c, id)));
  else for (const [k, set] of docListeners) if (k.startsWith(c + '/')) set.forEach(fn => fn(docSnap(c, k.slice(c.length + 1))));
}
const emitAll = () => { const cols = new Set([...store.keys(), ...colListeners.keys()]); cols.forEach(c => emit(c)); for (const k of docListeners.keys()) if (!cols.has(k.split('/')[0])) emit(k.split('/')[0]); };

/* ---------- Backends ---------- */

function localBackend() {
  const load = () => {
    store.clear();
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      for (const [c, docs] of Object.entries(raw)) Object.entries(docs).forEach(([id, d]) => colMap(c).set(id, d));
    } catch { /* sem dados salvos */ }
  };
  const save = () => {
    const out = {};
    for (const [c, m] of store) out[c] = Object.fromEntries(m);
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(out)); } catch (e) { throw { code: 'storage_full', message: String(e) }; }
  };
  window.addEventListener('storage', e => { if (e.key === LOCAL_KEY) { load(); emitAll(); } });
  return {
    mode: 'local',
    init: async () => { load(); },
    put: async () => save(),
    remove: async () => save(),
  };
}

function supabaseBackend() {
  const sb = createClient(url, key);
  const resync = async () => {
    const { data, error } = await sb.from(TABLE).select('colecao,id,dados');
    if (error) throw error;
    store.clear();
    data.forEach(r => colMap(r.colecao).set(r.id, r.dados || {}));
  };
  return {
    mode: 'supabase',
    init: async () => {
      await resync();
      sb.channel('reforma-docs')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, p => {
          if (p.eventType === 'DELETE') {
            const { colecao, id } = p.old || {};
            if (colecao && id && colMap(colecao).delete(id)) emit(colecao, id);
          } else if (p.new) {
            colMap(p.new.colecao).set(p.new.id, p.new.dados || {});
            emit(p.new.colecao, p.new.id);
          }
        })
        .subscribe(status => {
          // Ao reconectar, recarrega tudo para não perder mudanças feitas enquanto estava offline.
          if (status === 'SUBSCRIBED' && loaded) resync().then(emitAll).catch(() => {});
        });
    },
    put: async (c, id, dados) => {
      const { error } = await sb.from(TABLE).upsert({ colecao: c, id, dados, atualizado_em: new Date().toISOString() });
      if (error) { await resync().then(emitAll).catch(() => {}); throw error; }
    },
    remove: async (c, id) => {
      const { error } = await sb.from(TABLE).delete().eq('colecao', c).eq('id', id);
      if (error) { await resync().then(emitAll).catch(() => {}); throw error; }
    },
  };
}

const backend = url && key ? supabaseBackend() : localBackend();
const ready = backend.init()
  .then(() => { loaded = true; emitAll(); })
  .catch(e => { loadError = e; console.error('Reforma da Casa: erro ao carregar dados', e); });

/* ---------- API ---------- */

function docRef(c, id) {
  return {
    id,
    async set(dados) {
      colMap(c).set(id, { ...dados }); emit(c, id);
      await backend.put(c, id, { ...dados });
    },
    async update(campos) {
      const atual = colMap(c).get(id);
      if (!atual) throw { code: 'not_found', message: 'Documento não existe' };
      const novo = { ...atual, ...campos };
      colMap(c).set(id, novo); emit(c, id);
      await backend.put(c, id, novo);
    },
    async delete() {
      colMap(c).delete(id); emit(c, id);
      await backend.remove(c, id);
    },
    onSnapshot(next, error) {
      const k = c + '/' + id;
      if (!docListeners.has(k)) docListeners.set(k, new Set());
      docListeners.get(k).add(next);
      if (loaded) next(docSnap(c, id));
      else if (loadError && error) error(loadError);
      else if (error) ready.then(() => loadError && error(loadError));
      return () => docListeners.get(k).delete(next);
    },
  };
}

export const db = {
  mode: backend.mode,
  ready,
  collection(c) {
    return {
      doc: (id = newId()) => docRef(c, id),
      async add(dados) { const ref = docRef(c, newId()); await ref.set(dados); return ref; },
      onSnapshot(next, error) {
        if (!colListeners.has(c)) colListeners.set(c, new Set());
        colListeners.get(c).add(next);
        if (loaded) next(colSnap(c));
        else if (loadError && error) error(loadError);
        else if (error) ready.then(() => loadError && error(loadError));
        return () => colListeners.get(c).delete(next);
      },
    };
  },
  doc(path) {
    const [c, id] = path.split('/');
    return docRef(c, id);
  },
};
