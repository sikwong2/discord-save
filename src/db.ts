const fs = require('fs/promises');

export const load_db = async (file_path: string) => {
  try {
    const data = await fs.readFile(file_path, 'utf8');
    const json = JSON.parse(data);
    return json;
    return new Map(Object.entries(json));
  } catch (err) {
    throw new Error(err.message);
  }
}

export const save_db = async (file_path: string, data: any): Promise<boolean> => {
  fs.writeFile(file_path, JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    return true;
  });
  return false;
}
