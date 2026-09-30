# Orlando Chess Rankings

Club chess ratings for Central Florida. One Elo number follows a player to every meetup. Large type, no login.

Live site: [orlandochessrankings.com](https://www.orlandochessrankings.com/)

This repository is the website code. Games recorded after the site went live live in the database, not in these files. The SQL in `migrations/` is the starting roster and results.

## How ratings work

Everyone starts at 1200. After each game the rating moves with classic Elo, K = 32. Beating a stronger player is worth more. Rankings only list people who have recorded a game.

## Run it locally

```bash
npm install
npm run dev
```

Open the address the dev server prints. The preview stores data in memory, so a restart reloads the migrations.

## What’s in here

- `src/` — the site (standings, record a game, games, players, clubs, how ratings work)
- `migrations/` — clubs, players, and early game results
- `public/` — icon and share images
