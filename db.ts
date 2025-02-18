const { Pool } = require('pg');
const fs = require('fs/promises');

const pool = new Pool({
  host: 'localhost',
  port: '5432',
  database: Bun.env.POSTGRES_DB,
  user: Bun.env.POSTGRES_USER,
  password: Bun.env.POSTGRES_PASSWORD,
});

export const bind_user = async (user_id: string, guild_id: string, channel_id: string): Promise<boolean> => {
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

export const load_db = async (file_path: string) => {
  try {
    const data = await fs.readFile(file_path, 'utf8');
    const json = JSON.parse(data);
    return new Map(Object.entries(json));
  } catch (err) {
    throw new Error(err.message);
  }
}

export const save_db = async (file_path: string, data: any): Promise<boolean> => {
  fs.writeFile(file_path, JSON.stringify(Object.fromEntries(data)), (err) => {
    if (err) throw err;
    return true;
  });
  return false;
}
