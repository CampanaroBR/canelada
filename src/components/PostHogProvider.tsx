"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== "undefined" && KEY) {
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // App Router: capturamos manualmente na troca de rota
    capture_pageleave: true,
  });
}

/** App Router não dispara pageview sozinho (sem full reload) — capturamos no efeito. */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!KEY) return;
    const url = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/** Liga os eventos anônimos ao usuário logado — busca via /api/me em vez de passar
 * pelo layout raiz (evita forçar TODAS as páginas, incluindo as estáticas
 * como /termos e /privacidade, a virarem dinâmicas por causa do auth()). */
function IdentifyUser() {
  useEffect(() => {
    if (!KEY) return;
    fetch("/api/me")
      .then((r) => r.json())
      .then((data: { userId: string | null; email?: string | null }) => {
        if (data.userId) posthog.identify(data.userId, data.email ? { email: data.email } : undefined);
      })
      .catch(() => {});
  }, []);

  return null;
}

export function PostHogProvider() {
  if (!KEY) return null;
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
      <IdentifyUser />
    </Suspense>
  );
}
