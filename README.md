# sync-vercel-env

Sync local `.env` files to Vercel environment variables across all environments (production, preview, development) in one command.

## Install

```bash
npm install -g sync-vercel-env
```

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed and linked to your project

## Usage

```bash
# Sync .env to all environments
sync-vercel-env

# Sync a custom file
sync-vercel-env .env.local

# Target a specific environment
sync-vercel-env --env prod
sync-vercel-env --env preview
sync-vercel-env --env dev

# Remove all vars without uploading
sync-vercel-env --remove
sync-vercel-env --env dev --remove
```

### `--env` options

| Value              | Target       |
| ------------------ | ------------ |
| `prod`, `production`  | Production   |
| `pre`, `preview`      | Preview      |
| `dev`, `development`  | Development  |
| _(omit)_              | All three    |

## Programmatic Usage

```js
const { sync } = require("sync-vercel-env");

sync({ envFile: ".env.local", envFilter: "prod" });
```

## How it works

1. Reads existing Vercel env vars via `vercel env ls`
2. Removes them from the target environment(s)
3. Parses your local `.env` file
4. Uploads each variable to the target environment(s)

## License

MIT
