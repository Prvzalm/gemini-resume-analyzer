#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "apps", "web", "out");
const targets = [
  path.join(repoRoot, "apps", "api", "public"),
  path.join(repoRoot, "public"),
];

if (!fs.existsSync(sourceDir)) {
  console.error(`❌ Frontend build output not found at ${sourceDir}. Run "npm --prefix apps/web run build" first.`);
  process.exit(1);
}

function copyRecursive(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

targets.forEach((target) => {
  copyRecursive(sourceDir, target);
  console.log(`📦 Copied frontend build to ${target}`);
});
