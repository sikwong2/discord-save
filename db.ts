const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: '5432',
  database: Bun.env.POSTGRES_DB,
  user: Bun.env.POSTGRES_USER,
  password: Bun.env.POSTGRES_PASSWORD,
});

export const bind_user = async (user_id: string, guild_id: string, channel_id: string): Promise<boolean> => {
  /*
  const query = {
    text: `IF EXISTS (SELECT * FROM users WHERE user_id = $1;)
      BEGIN
        UPDATE users
        SET guild_id = $2, channel_id = $3
        WHERE user_id = $1
        RETURN *;
      END
      ELSE
      BEGIN
        INSERT INTO users(user_id, guild_id, channel_id)
        VALUES($1, $2, $3)
        RETURN *;
      END
`,
    values: [user_id, guild_id, channel_id],
  }
  */
  const query = {
    text: `
      INSERT INTO users (user_id, guild_id, channel_id)
VALUES ($1, $2, $3)
ON CONFLICT (user_id)
DO UPDATE SET 
    guild_id = $2,
    channel_id = $3
RETURNING *
`,
    values: [user_id, guild_id, channel_id]
  }
  const { rows } = await pool.query(query);
  console.log(rows);

  return rows ? true : false;
}




