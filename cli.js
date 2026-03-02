#!/usr/bin/env node

const { sync } = require("../src/index");

const args = process.argv.slice(2);
let envFile = "";
let envFilter = "";
let removeOnly = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--env":
      envFilter = args[++i];
      break;
    case "--remove":
      removeOnly = true;
      break;
    case "--help":
    case "-h":
      console.log(`
sync-vercel-env - Sync .env files to Vercel

Usage:
  sync-vercel-env [options] [env-file]

Options:
  --env <target>   Target environment: prod, preview, dev (default: all)
  --remove         Remove all vars without uploading
  -h, --help       Show this help

Examples:
  sync-vercel-env                          # sync .env to all environments
  sync-vercel-env .env.local               # sync custom file
  sync-vercel-env --env prod               # production only
  sync-vercel-env --env dev --remove       # remove dev vars only
`);
      process.exit(0);
    default:
      if (args[i].startsWith("-")) {
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
      }
      envFile = args[i];
  }
}

try {
  sync({ envFile: envFile || undefined, envFilter, removeOnly });
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
