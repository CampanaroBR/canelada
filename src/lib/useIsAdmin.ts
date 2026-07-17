"use client";

import { useEffect, useState } from "react";

const CACHE_KEY = "canelada:isAdmin";

// BottomNav/MenuSheet decidem se mostram itens de admin com base nisso.
// Sem cache, o valor inicial (false) sempre renderiza primeiro — a cada
// carregamento de página o usuário via os itens de admin "piscarem" (3
// botões viravam 4, 2 itens do menu viravam 3) assim que o fetch("/api/me")
// resolvia. Guardando o último valor conhecido no localStorage, a partir da
// segunda visita o estado certo já aparece no primeiro render — só a
// primeiríssima visita do navegador ainda pisca (não tem como evitar sem
// tornar o layout raiz inteiro dinâmico, o que tiraria /login, /termos e
// /privacidade da lista de páginas estáticas).
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(CACHE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        const admin = d.role === "ADMIN" || d.role === "SUPER_ADMIN";
        setIsAdmin(admin);
        try { localStorage.setItem(CACHE_KEY, admin ? "1" : "0"); } catch { /* privado/sem storage */ }
      })
      .catch(() => {});
  }, []);

  return isAdmin;
}

const SUPER_CACHE_KEY = "canelada:isSuperAdmin";

// Mesmo padrão do useIsAdmin, mas só pro dono do grupo (SUPER_ADMIN) — usado
// em itens exclusivos como "Editar votos".
export function useIsSuperAdmin(): boolean {
  const [isSuper, setIsSuper] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(SUPER_CACHE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        const sup = d.role === "SUPER_ADMIN";
        setIsSuper(sup);
        try { localStorage.setItem(SUPER_CACHE_KEY, sup ? "1" : "0"); } catch { /* privado/sem storage */ }
      })
      .catch(() => {});
  }, []);

  return isSuper;
}
