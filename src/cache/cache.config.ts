import { ConfigService } from "@nestjs/config";

export type CacheProvider = "memory" | "redis";

/**
 * Per-namespace-family TTLs in SECONDS. Keyed by family (the part of a
 * namespace before the first `:`), plus a `default` fallback used for any
 * family not listed. Single source of truth — services no longer hardcode
 * TTLs; CacheService resolves the value from here by the read's namespace.
 * Each entry is overridable via `CACHE_TTL_<FAMILY>` (e.g. `CACHE_TTL_USERLIST`).
 */
export interface CacheTtlConfig {
  default: number;
  [family: string]: number;
}

export interface CacheConfig {
  enabled: boolean;
  provider: CacheProvider;
  redisUrl?: string;
  keyPrefix: string;
  disabledNamespaces: Set<string>;
  opTimeoutMs: number;
  cbFailures: number;
  cbCooldownMs: number;
  /** §1.6 periodic counter logging cadence. */
  metricsIntervalMs: number;
  /** Per-family TTLs (seconds). See CacheTtlConfig. */
  ttl: CacheTtlConfig;
}

/** Built-in TTL defaults (seconds), per namespace family. Env overrides win. */
const TTL_DEFAULTS: CacheTtlConfig = {
  default: 300,
  user: 900,
  userlist: 180,
  userfilter: 300,
  ufields: 3600,
  cfields: 3600,
  usertenant: 600,
  userroles: 600,
  cohort: 300,
  cohortmember: 180,
  fields: 3600,
  form: 3600,
  tenant: 3600,
};

function loadTtlConfig(configService: ConfigService): CacheTtlConfig {
  const ttl = { ...TTL_DEFAULTS };
  for (const family of Object.keys(TTL_DEFAULTS)) {
    ttl[family] = toNumber(
      configService.get<string>(`CACHE_TTL_${family.toUpperCase()}`),
      TTL_DEFAULTS[family],
    );
  }
  return ttl;
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value !== undefined && !Number.isNaN(parsed) ? parsed : fallback;
}

export function loadCacheConfig(configService: ConfigService): CacheConfig {
  const provider = (configService.get<string>("CACHE_PROVIDER") || "memory").toLowerCase();

  return {
    enabled: toBool(configService.get<string>("CACHE_ENABLED"), false),
    provider: provider === "redis" ? "redis" : "memory",
    redisUrl: configService.get<string>("REDIS_URL"),
    keyPrefix: configService.get<string>("CACHE_KEY_PREFIX") || "ums",
    disabledNamespaces: new Set(
      (configService.get<string>("CACHE_DISABLED_NAMESPACES") || "")
        .split(",")
        .map((ns) => ns.trim())
        .filter(Boolean),
    ),
    opTimeoutMs: toNumber(configService.get<string>("CACHE_OP_TIMEOUT_MS"), 150),
    cbFailures: toNumber(configService.get<string>("CACHE_CB_FAILURES"), 5),
    cbCooldownMs: toNumber(configService.get<string>("CACHE_CB_COOLDOWN_MS"), 30000),
    metricsIntervalMs: toNumber(configService.get<string>("CACHE_METRICS_INTERVAL_MS"), 60000),
    ttl: loadTtlConfig(configService),
  };
}
