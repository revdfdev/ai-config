"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin", "merkmod.js");
const SKILL_DIRS = [".claude/skills", ".codex/skills", ".gemini/config/skills"];
const RULES = [".claude/CLAUDE.md", ".codex/AGENTS.md", ".gemini/GEMINI.md"];

function freshHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ai-config-test-"));
}

function run(home, ...args) {
  return execFileSync("node", [CLI, ...args], { env: { ...process.env, MERKMOD_HOME: home }, encoding: "utf8" });
}

function skillNames() {
  return fs.readdirSync(path.join(ROOT, "skills")).map((dir) => {
    const text = fs.readFileSync(path.join(ROOT, "skills", dir, "SKILL.md"), "utf8");
    return text.match(/^name:\s*(.+)$/m)[1].trim();
  });
}

test("copy install puts rules and every skill into all three tools", () => {
  const home = freshHome();
  run(home, "install");
  for (const rule of RULES) {
    const target = path.join(home, rule);
    assert.ok(!fs.lstatSync(target).isSymbolicLink());
    assert.strictEqual(fs.readFileSync(target, "utf8"), fs.readFileSync(path.join(ROOT, "AGENTS.md"), "utf8"));
  }
  for (const dir of SKILL_DIRS) {
    for (const name of skillNames()) assert.ok(fs.existsSync(path.join(home, dir, name, "SKILL.md")), `${dir}/${name}`);
  }
});

test("dry run changes nothing", () => {
  const home = freshHome();
  const out = run(home, "install", "--dry-run");
  assert.match(out, /dry run/);
  assert.deepStrictEqual(fs.readdirSync(home), []);
});

test("a skill dropped from the package is pruned on the next install", () => {
  const home = freshHome();
  run(home, "install");
  const stale = path.join(home, ".codex/skills/implementation-tracker");
  fs.mkdirSync(stale, { recursive: true });
  const manifestPath = path.join(home, ".merkmod/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.paths.push(stale);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  run(home, "install");
  assert.ok(!fs.existsSync(stale));
});

test("dangling links from the old install.sh are pruned", () => {
  const home = freshHome();
  const dir = path.join(home, ".claude/skills");
  fs.mkdirSync(dir, { recursive: true });
  fs.symlinkSync(path.join(ROOT, "skills", "ROOT_CAUSE"), path.join(dir, "root-cause"));
  run(home, "install");
  assert.ok(!fs.existsSync(path.join(dir, "root-cause")) && !isLink(path.join(dir, "root-cause")));
});

test("a user's own file at a target is backed up, not overwritten", () => {
  const home = freshHome();
  fs.mkdirSync(path.join(home, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(home, ".codex/AGENTS.md"), "mine");
  run(home, "install");
  assert.strictEqual(fs.readFileSync(path.join(home, ".codex/AGENTS.md.bak-merkmod"), "utf8"), "mine");
});

test("skills the package does not own are left alone", () => {
  const home = freshHome();
  const system = path.join(home, ".codex/skills/.system/imagegen");
  fs.mkdirSync(system, { recursive: true });
  run(home, "install");
  run(home, "uninstall");
  assert.ok(fs.existsSync(system));
});

test("link mode symlinks to the checkout and re-run reports ok", () => {
  const home = freshHome();
  run(home, "install", "--link");
  const target = path.join(home, ".claude/CLAUDE.md");
  assert.strictEqual(fs.readlinkSync(target), path.join(ROOT, "AGENTS.md"));
  assert.match(run(home, "install", "--link"), new RegExp(`ok\\s+${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
});

test("uninstall removes exactly what was installed", () => {
  const home = freshHome();
  run(home, "install");
  run(home, "uninstall");
  for (const rule of RULES) assert.ok(!fs.existsSync(path.join(home, rule)));
  for (const dir of SKILL_DIRS) assert.deepStrictEqual(fs.readdirSync(path.join(home, dir)), []);
});

function isLink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}
