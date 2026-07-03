"use client";

import { useEffect } from "react";
import { resubscribeIfGranted } from "@/lib/pushClient";

/**
 * Não renderiza nada. Garante que quem já concedeu permissão de notificação
 * tenha uma subscription ativa registrada no servidor (novo aparelho, cache
 * limpo, re-login). Nunca pede permissão — isso acontece no onboarding/perfil.
 */
export function PushAutoEnroll() {
  useEffect(() => { void resubscribeIfGranted(); }, []);
  return null;
}
