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
vercel-env-push - Push .env files to Vercel

Usage:
  vercel-env-push [options] [env-file]

Options:
  --env <target>   Target environment: prod, preview, dev (default: all)
  --remove         Remove all vars without uploading
  -h, --help       Show this help

Examples:
  vercel-env-push                          # sync .env to all environments
  vercel-env-push .env.local               # sync custom file
  vercel-env-push --env prod               # production only
  vercel-env-push --env dev --remove       # remove dev vars only
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
