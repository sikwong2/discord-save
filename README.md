# How to use
1. `bun install` to install the packages
2. Edit the .env to use your bot's token and your Discord ID
3. Run `bun --watch src/index.ts`
    - `/init` to add yourself to the database
    -  Ping the bot in a reply to save the referenced message
    - `/collection` to view all your saved messages
    - `/reset` to reset the database if your Discord ID is in the `.env`
