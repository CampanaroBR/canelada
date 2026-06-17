"use client";

import { usePushSubscription } from "@/hooks/usePushSubscription";

export function PushInit() {
  usePushSubscription();
  return null;
}
