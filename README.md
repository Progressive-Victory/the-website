## Getting Started with Development

Welcome to the PV Frontpage Redux repo! This is the source code of our website. Before contributing to the codebase you **MUST** read the following information. If you're a fullstack Next.js pro you can quickly skim this.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

If you're new to Next.js development please start by [reading the docs](https://nextjs.org/docs/app/getting-started/project-structure) to get a understanding of how a Next.js site works. The underlying reactive web development framework is [React](https://react.dev/learn), the linked page has a great tutorial for getting you aquainted quickly.

The language used in this project is [Typescript](https://www.typescriptlang.org/docs/) which is a typed version of Javascript. Please take a moment to review Typescript basics and best practices before getting started.

By continuing with development you are agreeing that you understand these frameworks and will attempt to work within the best practices and conventions.

### 1. Create a New Branch

Check out a new branch from `main` before you begin working on any new feature. If you do not understand the previous sentence see [git - the simple guide](https://rogerdudler.github.io/git-guide/) for a primer.

### 2. Installing

**BEFORE** running the server you must have [Node.js](https://nodejs.org/en/download) installed on your machine. We officialy use the 20.19.1 LTS version of Node but backward compatability means you should be able to use any LTS >= 20.19.1 to run the server.

**AFTER** installing Node.js you **MUST** install [pnpm](https://pnpm.io/installation) to manage the dependencies for this project. We do **NOT** use npm, if you use npm your builds will fail!

The easiest way to install pnpm is via npm after installing Node.js. Otherwise visit the linked page above to install it on your machine.

```
npm install -g pnpm@latest-10
```

First, install the dependencies,

```
pnpm install
```

### 3. Configure

Next, check the .env.example file you'll see the list of required variables for proper function of the development server. Below is how you should configure each variable as of writing. All requests for credentials should be directed to Joops on discord.

```bash
# $PROJECT_DIR/.env

# These are the values for the development Discord bot
DISCORD_CLIENT_ID="1234"
DISCORD_CLIENT_SECRET="abcdefg"
DISCORD_BOT_TOKEN="mx213"

# The auth secret and URL must stay these values for development
NEXTAUTH_SECRET="abcdefg"
NEXTAUTH_URL="http://localhost:3000"

# The ID of the Discord server the bot is in (for dev purposes would likely be PV Dev Server)
GUILD_ID="122"

# Unless needed for you work the SMS API information is restricted
NEUTRINO_USERID="pvuser"
NEUTRINO_SECRET="123egh"

# To connect to our dev DB
MONGODB_URI="mongodb://localhost:27017"

# Does not need to change
SITE_URL="https://example.com"
```

### 4. Run

Finally, run the development server

```
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Upon saving your work the server automatically (hot) reloads with your changes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Tests - Under Construction

Make sure you run the setup steps first:

### Setup

```sh
npx playwright install --with-deps
```

### Run tests

```
pnpm run test
```

## Deploy on Vercel

Only certain users have the ability to deploy branches on Vercel. Create a PR and request help from @somejoops or attend coding team meeting Mondays at 5PM PST / 8PM EST to have your PR approved.
