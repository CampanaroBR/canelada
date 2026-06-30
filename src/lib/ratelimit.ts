import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limit com Upstash Redis. Fail-open: se o Upstash não estiver configurado
 * (sem env) ou der erro, permite a requisição — nunca derruba o app por causa do limitador.
 *
 * Provisionado em Vercel via Marketplace (Upstash for Redis). O Vercel injeta as envs
 * como KV_REST_API_URL/KV_REST_API_TOKEN; aceitamos também UPSTASH_REDIS_REST_URL/TOKEN
 * caso a integração mude de nome no futuro.
 */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

type Window = `${number} s` | `${number} m` | `${number} h`;
const cache = new Map<string, Ratelimit>();

function getLimiter(name: string, limit: number, window: Window): Ratelimit | null {
  if (!redis) return null;
  const key = `${name}:${limit}:${window}`;
  let l = cache.get(key);
  if (!l) {
    l = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, window), prefix: `rl:${name}`, analytics: false });
    cache.set(key, l);
  }
  return l;
}

/** Retorna { ok } — true se permitido. Sem Upstash, sempre ok (fallback). */
export async function rateLimit(name: string, id: string, limit: number, window: Window = "60 s"): Promise<{ ok: boolean }> {
  const limiter = getLimiter(name, limit, window);
  if (!limiter) return { ok: true };
  try {
    const r = await limiter.limit(id);
    return { ok: r.success };
  } catch {
    return { ok: true }; // fail-open
  }
}
