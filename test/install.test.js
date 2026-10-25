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

function freshHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "merkmod-test-"));
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

function writeSkill(dir, name, body) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), `---\nname: ${name}\ndescription: ${body}\n---\n${body}\n`);
}

test("setup makes every skill available in all three tools as real copies", () => {
  const home = freshHome();
  run(home, "setup");
  for (const dir of SKILL_DIRS) {
    for (const name of skillNames()) {
      const target = path.join(home, dir, name);
      assert.ok(fs.existsSync(path.join(target, "SKILL.md")), `${dir}/${name}`);
      assert.ok(!fs.lstatSync(target).isSymbolicLink(), `${dir}/${name} is a copy`);
    }
  }
});

test("setup never creates or touches the user's rules files", () => {
  const home = freshHome();
  fs.mkdirSync(path.join(home, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(home, ".claude/CLAUDE.md"), "my rules");
  run(home, "setup");
  assert.strictEqual(fs.readFileSync(path.join(home, ".claude/CLAUDE.md"), "utf8"), "my rules");
  assert.ok(!fs.existsSync(path.join(home, ".codex/AGENTS.md")));
  assert.ok(!fs.existsSync(path.join(home, ".gemini/GEMINI.md")));
});

test("a user's own skill with the same name is left exactly as it was", () => {
  const home = freshHome();
  const mine = path.join(home, ".claude/skills/tdd");
  writeSkill(mine, "tdd", "my own tdd");
  const out = run(home, "setup");
  assert.match(out, /skip/);
  assert.match(fs.readFileSync(path.join(mine, "SKILL.md"), "utf8"), /my own tdd/);
  assert.deepStrictEqual(fs.readdirSync(path.join(home, ".claude/skills")).filter((n) => n.startsWith("tdd")), ["tdd"]);
  run(home, "uninstall");
  assert.match(fs.readFileSync(path.join(mine, "SKILL.md"), "utf8"), /my own tdd/);
});

test("running setup again updates skills and removes ones dropped from the package", () => {
  const home = freshHome();
  run(home, "setup");
  const plan = path.join(home, ".codex/skills/plan/SKILL.md");
  fs.writeFileSync(plan, "stale");
  const dropped = path.join(home, ".codex/skills/implementation-tracker");
  writeSkill(dropped, "implementation-tracker", "old");
  const manifestPath = path.join(home, ".merkmod/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.paths.push(dropped);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  run(home, "setup");
  assert.notStrictEqual(fs.readFileSync(plan, "utf8"), "stale");
  assert.ok(!fs.existsSync(dropped));
});

test("upgrading from 1.0.0 gives the user back the rules file it had replaced", () => {
  const home = freshHome();
  const rules = path.join(home, ".claude/CLAUDE.md");
  fs.mkdirSync(path.dirname(rules), { recursive: true });
  fs.writeFileSync(rules, "merkmod 1.0.0 rules");
  fs.writeFileSync(`${rules}.bak-merkmod`, "my rules");
  fs.mkdirSync(path.join(home, ".merkmod"), { recursive: true });
  fs.writeFileSync(path.join(home, ".merkmod/manifest.json"), JSON.stringify({ paths: [rules] }));
  run(home, "setup");
  assert.strictEqual(fs.readFileSync(rules, "utf8"), "my rules");
  assert.ok(!fs.existsSync(`${rules}.bak-merkmod`));
});

test("dry run changes nothing", () => {
  const home = freshHome();
  assert.match(run(home, "setup", "--dry-run"), /dry run/);
  assert.deepStrictEqual(fs.readdirSync(home), []);
});

test("install still works as an alias for setup", () => {
  const home = freshHome();
  run(home, "install");
  assert.ok(fs.existsSync(path.join(home, ".claude/skills/plan/SKILL.md")));
});

test("uninstall removes only merkmod's skills", () => {
  const home = freshHome();
  writeSkill(path.join(home, ".codex/skills/.system/imagegen"), "imagegen", "built in");
  writeSkill(path.join(home, ".claude/skills/mine"), "mine", "mine");
  run(home, "setup");
  run(home, "uninstall");
  for (const name of skillNames()) for (const dir of SKILL_DIRS) assert.ok(!fs.existsSync(path.join(home, dir, name)));
  assert.ok(fs.existsSync(path.join(home, ".codex/skills/.system/imagegen")));
  assert.ok(fs.existsSync(path.join(home, ".claude/skills/mine")));
  assert.ok(!fs.existsSync(path.join(home, ".merkmod")));
});
