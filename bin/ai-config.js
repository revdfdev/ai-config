#!/usr/bin/env node
// Installs this package's AGENTS.md and skills into Claude Code, Codex and Gemini/Antigravity.
// Copy mode (default, for npx) copies files; --link symlinks to this checkout (for editing locally).
// A manifest records what was installed so removed skills are pruned and uninstall is exact.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOME = process.env.AI_CONFIG_HOME || os.homedir();
const MANIFEST = path.join(HOME, ".ai-config", "manifest.json");
const RULE_TARGETS = [".claude/CLAUDE.md", ".codex/AGENTS.md", ".gemini/GEMINI.md"];
const SKILL_DIRS = [".claude/skills", ".codex/skills", ".gemini/config/skills"];

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("-")) || "help";
const dryRun = args.includes("--dry-run");
const linkMode = args.includes("--link");

function log(action, target, detail = "") {
  console.log(`${action.padEnd(8)}${target}${detail ? ` ${detail}` : ""}`);
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return { paths: [] };
  }
}

function lexists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

function skills() {
  const dir = path.join(ROOT, "skills");
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const src = path.join(dir, e.name);
      const text = fs.readFileSync(path.join(src, "SKILL.md"), "utf8");
      const match = text.match(/^name:\s*(.+)$/m);
      return match ? { name: match[1].trim().replace(/^["']|["']$/g, ""), src } : null;
    })
    .filter(Boolean);
}

// Existing files we didn't install are moved aside, never overwritten.
function clear(target, owned) {
  if (!lexists(target)) return;
  const st = fs.lstatSync(target);
  if (st.isSymbolicLink() || owned.has(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  } else {
    fs.renameSync(target, `${target}.bak-ai-config`);
    log("backup", target, `-> ${target}.bak-ai-config`);
  }
}

function place(src, target, owned) {
  if (linkMode && lexists(target) && fs.lstatSync(target).isSymbolicLink() && fs.readlinkSync(target) === src) {
    log("ok", target);
    return;
  }
  log(linkMode ? "link" : "copy", target, `<- ${src}`);
  if (dryRun) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  clear(target, owned);
  if (linkMode) fs.symlinkSync(src, target);
  else fs.cpSync(src, target, { recursive: true });
}

// Symlinks left by older link-based installs (this checkout or any ai-config clone) that no longer resolve.
function danglingAiConfigLinks() {
  const found = [];
  for (const rel of SKILL_DIRS) {
    const dir = path.join(HOME, rel);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.lstatSync(p);
      if (!st.isSymbolicLink() || fs.existsSync(p)) continue;
      const linkTarget = fs.readlinkSync(p);
      if (linkTarget.startsWith(ROOT) || linkTarget.includes(`${path.sep}ai-config${path.sep}skills${path.sep}`)) found.push(p);
    }
  }
  return found;
}

function remove(paths) {
  for (const p of paths) {
    if (!lexists(p)) continue;
    log("remove", p);
    if (!dryRun) fs.rmSync(p, { recursive: true, force: true });
  }
}

function install() {
  const previous = readManifest();
  const owned = new Set(previous.paths);
  const installed = [];
  const agents = path.join(ROOT, "AGENTS.md");
  for (const rel of RULE_TARGETS) {
    const target = path.join(HOME, rel);
    place(agents, target, owned);
    installed.push(target);
  }
  const skillList = skills();
  for (const { name, src } of skillList) {
    for (const rel of SKILL_DIRS) {
      const target = path.join(HOME, rel, name);
      place(src, target, owned);
      installed.push(target);
    }
  }
  const keep = new Set(installed);
  remove(previous.paths.filter((p) => !keep.has(p)));
  remove(danglingAiConfigLinks());
  if (!dryRun) {
    fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
    const version = require(path.join(ROOT, "package.json")).version;
    fs.writeFileSync(MANIFEST, JSON.stringify({ version, mode: linkMode ? "link" : "copy", source: ROOT, paths: installed }, null, 2));
  }
  console.log(dryRun ? "(dry run - nothing changed)" : `installed ${skillList.length} skills for Claude, Codex and Gemini`);
}

function uninstall() {
  const { paths } = readManifest();
  remove(paths);
  if (!dryRun) fs.rmSync(MANIFEST, { force: true });
  console.log(dryRun ? "(dry run - nothing changed)" : "uninstalled; *.bak-ai-config backups were left in place");
}

function status() {
  const manifest = readManifest();
  if (!manifest.paths.length) {
    console.log("not installed");
    return;
  }
  console.log(`version ${manifest.version} (${manifest.mode}) from ${manifest.source}`);
  for (const p of manifest.paths) log(fs.existsSync(p) ? "ok" : "missing", p);
}

const commands = { install, uninstall, status };
if (!commands[command]) {
  console.log(`usage: ai-config <install|uninstall|status> [--dry-run] [--link]
  install    copy AGENTS.md and skills into ~/.claude, ~/.codex, ~/.gemini (prunes removed skills)
  uninstall  remove everything the last install put there
  status     show what is installed
  --link     symlink to this checkout instead of copying (local editing)
  --dry-run  print what would change`);
  process.exit(command === "help" ? 0 : 1);
}
commands[command]();
