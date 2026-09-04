import 'server-only';
// A bounded per-instance burst guard. For distributed abuse protection use the hosting firewall.
const buckets = new Map<string, { count: number; expires: number }>();
export function allowCheckoutRequest(req: Request): boolean {
  const now = Date.now();
  for (const [key, entry] of buckets) if (entry.expires <= now) buckets.delete(key);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = ip.slice(0, 100);
  const entry = buckets.get(key) || { count: 0, expires: now + 60_000 };
  if (entry.count >= 8 || (!buckets.has(key) && buckets.size >= 2000)) return false;
  entry.count++; buckets.set(key, entry); return true;
}
