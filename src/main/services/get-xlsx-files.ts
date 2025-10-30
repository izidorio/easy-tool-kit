import { openDb } from "../../database/database";

export async function getFiles(): Promise<{ path: string }[]> {
  const db = await openDb();
  return db.all('SELECT "path" FROM files WHERE "path" like "%.xlsx";');
}
