const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ENV_ALIASES = {
  prod: "production",
  production: "production",
  pre: "preview",
  preview: "preview",
  dev: "development",
  development: "development",
};

const ALL_ENVIRONMENTS = ["production", "preview", "development"];

function exec(cmd, { silent = false } = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: silent ? "pipe" : ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const vars = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1);

    // Strip inline comments (not inside quotes)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      value = value.split("#")[0];
    }

    value = value.trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    vars.push({ key, value });
  }

  return vars;
}

function getExistingVars() {
  const output = exec("vercel env ls", { silent: true });
  if (!output) return [];

  const lines = output.split("\n").slice(2); // skip header
  const keys = new Set();
  for (const line of lines) {
    const key = line.trim().split(/\s+/)[0];
    if (key) keys.add(key);
  }
  return [...keys].sort();
}

function removeVars(keys, environments) {
  for (const key of keys) {
    for (const env of environments) {
      console.log(`  Removing: ${key} (${env})`);
      exec(`vercel env rm "${key}" ${env} -y`, { silent: true });
    }
  }
}

function uploadVars(vars, environments) {
  for (const { key, value } of vars) {
    for (const env of environments) {
      // Remove first to avoid "already exists" error
      exec(`vercel env rm "${key}" ${env} -y`, { silent: true });
      console.log(`  Adding: ${key} (${env})`);
      execSync(`printf '%s' '${value.replace(/'/g, "'\\''")}' | vercel env add "${key}" ${env}`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }
  }
}

function resolveEnvironments(envFilter) {
  if (!envFilter) return ALL_ENVIRONMENTS;
  const resolved = ENV_ALIASES[envFilter];
  if (!resolved) {
    throw new Error(`Unknown env: '${envFilter}'. Valid: prod, production, pre, preview, dev, development`);
  }
  return [resolved];
}

function sync({ envFile, envFilter, removeOnly = false } = {}) {
  const environments = resolveEnvironments(envFilter);
  const envLabel = environments.join(", ");

  if (!removeOnly && !envFile) {
    envFile = ".env";
  }

  if (!removeOnly && !fs.existsSync(envFile)) {
    throw new Error(`Env file '${envFile}' not found.`);
  }

  if (removeOnly) {
    console.log(`>>> Removing all Vercel env vars (${envLabel})\n`);
  } else {
    console.log(`>>> Syncing '${envFile}' to Vercel (${envLabel})\n`);
  }

  // Step 1: Remove existing vars
  console.log(`Step 1: Removing existing Vercel env vars from: ${envLabel}...`);
  const existing = getExistingVars();

  if (existing.length === 0) {
    console.log("  (no existing vars found)");
  } else {
    removeVars(existing, environments);
  }

  console.log("");

  if (removeOnly) {
    console.log(`Done. All vars have been removed from Vercel (${envLabel}).`);
    return;
  }

  // Step 2: Upload
  console.log(`Step 2: Uploading vars from '${envFile}' to: ${envLabel}...`);
  const vars = parseEnvFile(envFile);
  uploadVars(vars, environments);

  console.log("");
  console.log(`Done. All vars from '${envFile}' have been synced to Vercel (${envLabel}).`);
}

module.exports = { sync, parseEnvFile, resolveEnvironments };
