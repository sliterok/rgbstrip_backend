# RGB Strip Backend

This project controls an RGB LED strip and exposes a Telegram bot for interaction. The backend is written in TypeScript and relies on environment variables defined in `src/backend/config.ts`.

## Environment variables

Create a `.env` file in the project root with the following variables:

-   `TZ` – optional timezone string that will be assigned to `process.env.TZ`.
-   `routerMac` – MAC address of the router interface used to query connected devices.
-   `routerDevice` – substring of your phone/host name as reported by the router.
-   `routerEndpoint` – base URL of the router API.
-   `routerPassword` – password for the router API.
-   `tgAllowedUsers` – comma separated list of Telegram user IDs allowed to use the bot.
-   `tgApiKey` – Telegram Bot API key.
-   `externalUrl` – public URL used by Telegram Web App.

## Install

Use your preferred package manager to install dependencies:

```bash
npm install
# or
pnpm install
```

## Build

Compile the project with

```bash
npm run build
# or
pnpm build
```

## Run

During development use

```bash
npm run dev
```

After building you can serve the production build with

```bash
npm start
```
