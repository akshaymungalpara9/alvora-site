/**
 * Build guard — exits non-zero if any TODO(alvora) marker survives outside the allowlist.
 * Run via `pnpm check` or standalone: `node scripts/check-no-todo.mjs`
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const allowlist = JSON.parse(
  fs.readFileSync(path.join(__dirname, "todo-allowlist.json"), "utf-8")
);

function isAllowlisted(relPath) {
  return allowlist.allowPatterns.some((pattern) => {
    const regexStr = pattern
      .split("**")
      .map((part) =>
        part.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")
      )
      .join(".*");
    return new RegExp(`^${regexStr}$`).test(relPath);
  });
}

const dirs = ["content", "server", "client", "shared"].filter((d) =>
  fs.existsSync(path.join(root, d))
);

if (dirs.length === 0) {
  console.log("[check-no-todo] No directories to scan.");
  process.exit(0);
}

let output = "";
try {
  output = execSync(`grep -rn "TODO(alvora)" ${dirs.join(" ")}`, {
    cwd: root,
    encoding: "utf-8",
  });
} catch (err) {
  if (err.status === 1) {
    console.log("[check-no-todo] No TODO(alvora) markers found. ✓");
    process.exit(0);
  }
  throw err;
}

const violations = output
  .split("\n")
  .filter(Boolean)
  .filter((line) => !isAllowlisted(line.split(":")[0]));

if (violations.length === 0) {
  console.log("[check-no-todo] All TODO(alvora) markers are in allowlisted files. ✓");
  process.exit(0);
}

console.error("[check-no-todo] Unresolved TODO(alvora) markers found outside allowlist:");
for (const v of violations) console.error(`  ${v}`);
console.error("\nFix these or add the files to scripts/todo-allowlist.json.");
process.exit(1);
