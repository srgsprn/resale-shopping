#!/usr/bin/env node
/**
 * Полный цикл: парсинг alfa-resale → JSON → импорт в PostgreSQL.
 * Крон на VPS (пример раз в сутки):
 *   0 4 * * * cd /root/resale-shopping && /usr/bin/node scripts/sync-catalog.mjs >> /var/log/resale-catalog-sync.log 2>&1
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function runNode(relScript) {
  const r = spawnSync(process.execPath, [path.join(root, relScript)], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

console.log("==> scrape-alfa-export");
runNode("scripts/scrape-alfa-export.mjs");
console.log("==> import-alfa-json");
runNode("scripts/import-alfa-json.mjs");
console.log("==> catalog sync OK");
