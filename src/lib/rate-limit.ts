import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

// Redis est opérationnel seulement si les vraies credentials sont fournies
const isRedisConfigured =
  redisUrl.startsWith("https://") &&
  redisUrl !== "https://..." &&
  redisToken !== "..." &&
  redisToken.length > 10;

const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
      prefix: "logihub",
    })
  : null;

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  if (!ratelimit) {
    // Redis non configuré (dev local) — on passe directement
    return handler();
  }

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  return handler();
}
