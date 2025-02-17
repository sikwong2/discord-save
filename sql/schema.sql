DROP TABLE IF EXISTS users;

CREATE TABLE users (user_id TEXT UNIQUE PRIMARY KEY, guild_id TEXT, channel_id TEXT);
