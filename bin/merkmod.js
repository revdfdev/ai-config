#!/usr/bin/env node
// Copies this package's skills into Claude Code, Codex and Gemini/Antigravity.
// Never touches the user's rules files or skills it didn't install; ~/.merkmod/manifest.json records what it owns.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOME = process.env.MERKMOD_HOME || os.homedir();
const MANIFEST = path.join(HOME, ".merkmod", "manifest.json");
const SKILL_DIRS = [".claude/skills", ".codex/skills", ".gemini/config/skills"];

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("-")) || "help";
const dryRun = args.includes("--dry-run");

function log(action, target) {
  console.log(`${action.padEnd(8)}${target}`);
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return { paths: [] };
  }
}

function skills() {
  const dir = path.join(ROOT, "skills");
  return fs.readdirSync(dir).map((entry) => {
    const src = path.join(dir, entry);
    const name = fs.readFileSync(path.join(src, "SKILL.md"), "utf8").match(/^name:\s*(.+)$/m)[1].trim();
    return { name, src };
  });
}

// 1.0.0 copied rules files over the user's own and kept theirs as *.bak-merkmod; give it back.
function remove(p) {
  log("remove", p);
  if (dryRun) return;
  fs.rmSync(p, { recursive: true, force: true });
  if (fs.existsSync(`${p}.bak-merkmod`)) fs.renameSync(`${p}.bak-merkmod`, p);
}

function setup() {
  const owned = new Set(readManifest().paths);
  const installed = [];
  const list = skills();
  for (const { name, src } of list) {
    for (const rel of SKILL_DIRS) {
      const target = path.join(HOME, rel, name);
      if (fs.existsSync(target) && !owned.has(target)) {
        log("skip", `${target} (yours, left as is)`);
        continue;
      }
      log("copy", target);
      installed.push(target);
      if (dryRun) continue;
      fs.rmSync(target, { recursive: true, force: true });
      fs.cpSync(src, target, { recursive: true });
    }
  }
  const keep = new Set(installed);
  for (const p of owned) if (!keep.has(p)) remove(p);
  if (dryRun) return console.log("(dry run - nothing changed)");
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify({ version: require("../package.json").version, paths: installed }, null, 2));
  console.log(`${list.length} skills ready in Claude Code, Codex and Gemini. Restart them to pick it up.`);
}

function uninstall() {
  for (const p of readManifest().paths) if (fs.existsSync(p)) remove(p);
  if (dryRun) return console.log("(dry run - nothing changed)");
  fs.rmSync(path.dirname(MANIFEST), { recursive: true, force: true });
  console.log("merkmod skills removed.");
}

const commands = { setup, install: setup, uninstall };
if (!commands[command]) {
  console.log(`usage: npx merkmod <setup|uninstall> [--dry-run]
  setup      add the skills to Claude Code, Codex and Gemini (run again to update)
  uninstall  remove them`);
  process.exit(command === "help" ? 0 : 1);
}
commands[command]();
