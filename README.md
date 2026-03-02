# vercel-env-push

Push local `.env` files to Vercel environment variables across all environments (production, preview, development) in one command.

## Install

```bash
npm install -g vercel-env-push
```

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed and linked to your project

## Usage

```bash
# Push .env to all environments
vercel-env-push

# Sync a custom file
vercel-env-push .env.local

# Target a specific environment
vercel-env-push --env prod
vercel-env-push --env preview
vercel-env-push --env dev

# Remove all vars without uploading
vercel-env-push --remove
vercel-env-push --env dev --remove
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
const { sync } = require("vercel-env-push");

sync({ envFile: ".env.local", envFilter: "prod" });
```

## How it works

1. Reads existing Vercel env vars via `vercel env ls`
2. Removes them from the target environment(s)
3. Parses your local `.env` file
4. Uploads each variable to the target environment(s)

## License

MIT
