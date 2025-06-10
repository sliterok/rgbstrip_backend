# RGB Strip Backend

This project controls an RGB LED strip and exposes a Telegram bot for interaction. The backend is written in TypeScript and relies on environment variables defined in `src/core/config.ts`.

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

Example `.env` file:

```env
TZ=Europe/Berlin
routerMac=AA:BB:CC:DD:EE:FF
routerDevice=my-phone
routerEndpoint=http://router.local
routerPassword=your-router-password
tgAllowedUsers=123456789
tgApiKey=123456:ABC-DEF
externalUrl=https://example.com
```

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

Run the server with `NODE_ENV=production` so that debugging routes such as
`/debug/stream` are disabled.

## Telegram bot

1. Message [@BotFather](https://t.me/BotFather) and run `/newbot`.
2. Choose a name and username for your bot.
3. BotFather will provide a token – put it in `tgApiKey` inside `.env`.
4. Use [@userinfobot](https://t.me/userinfobot) to find your numeric user ID.
5. Set this ID (or multiple comma‑separated IDs) in `tgAllowedUsers`.
