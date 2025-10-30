import { openDb } from '../../database/database';
//import { formatBytes } from "./format-bytes";

export async function getTotalSizeAccount(confidential_id: string): Promise<string> {
  const db = await openDb();
  const result = await db.get('SELECT SUM(gpg_size) as total FROM links WHERE confidential_id = ?;', [confidential_id]);

  // return formatBytes(Number(result.total || "0"));
  return result.total || '0';
}
