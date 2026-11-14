// Token-Bucket je Schlüssel: Kapazität = erlaubter Stoß, Nachfüllrate = dauerhaft erlaubte Anfragen pro Sekunde. Die Uhr wird übergeben, damit Tests Zeit steuern.
export function createLimiter({ capacity, refillPerSecond, clock }) {
  const buckets = new Map();
  return {
    take(key) {
      const now = clock();
      const bucket = buckets.get(key) ?? { tokens: capacity, at: now };
      bucket.tokens = Math.min(capacity, bucket.tokens + ((now - bucket.at) / 1000) * refillPerSecond);
      bucket.at = now;
      buckets.set(key, bucket);
      if (bucket.tokens >= 1) { bucket.tokens -= 1; return { allowed: true, retryAfterSeconds: 0 }; }
      return { allowed: false, retryAfterSeconds: Math.ceil((1 - bucket.tokens) / refillPerSecond) };
    },
  };
}
