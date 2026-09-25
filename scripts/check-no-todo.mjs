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

// Placeholder patterns that must never reach a build. Each entry is a
// fixed-string grep pattern; add to scripts/todo-allowlist.json to exempt
// specific files (same allowlist is applied to every pattern).
const PATTERNS = [
  "TODO(alvora)",      // explicit in-code work markers
  "data-alvora-todo",  // rendered hidden TODO spans (visible as broken sentences)
  "/* COPY:",          // content-team placeholder strings
];

let output = "";
for (const pattern of PATTERNS) {
  try {
    const found = execSync(`grep -rnF "${pattern}" ${dirs.join(" ")}`, {
      cwd: root,
      encoding: "utf-8",
    });
    if (found) output += found;
  } catch (err) {
    if (err.status !== 1) throw err; // 1 = no matches, which is the goal
  }
}

const violations = output
  .split("\n")
  .filter(Boolean)
  .filter((line) => !isAllowlisted(line.split(":")[0]));

if (violations.length === 0) {
  console.log("[check-no-todo] All placeholder markers are in allowlisted files. ✓");
  process.exit(0);
}

console.error("[check-no-todo] Unresolved placeholder markers found outside allowlist:");
for (const v of violations) console.error(`  ${v}`);
console.error("\nFix these or add the files to scripts/todo-allowlist.json.");
process.exit(1);
