"use client";

/**
 * Ativação de push no cliente (best-effort, nunca lança).
 * - enablePush(): registra SW, pede permissão e cria a subscription. Chamar a partir
 *   de um gesto do usuário (ex.: submit do onboarding) — exigência do iOS/Chrome.
 * - resubscribeIfGranted(): se a permissão JÁ foi concedida mas não há subscription
 *   (novo aparelho, cache limpo), refaz em silêncio. Seguro pra rodar em qualquer load.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function supported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

async function subscribeAndSave(): Promise<boolean> {
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return false;
  const reg = await navigator.serviceWorker.register("/sw.js");
  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
  });
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return res.ok;
}

export async function enablePush(): Promise<boolean> {
  try {
    if (!supported()) return false;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;
    return await subscribeAndSave();
  } catch {
    return false;
  }
}

export async function resubscribeIfGranted(): Promise<void> {
  try {
    if (!supported()) return;
    if (Notification.permission !== "granted") return;
    await subscribeAndSave();
  } catch { /* silencioso */ }
}
