import { openDb } from '../../database/database';
//import { formatBytes } from './format-bytes';

export async function getTotalSizeCloud(cloud_id: number): Promise<string> {
  const db = await openDb();
  const result = await db.get('SELECT SUM(gpg_size) as total FROM links WHERE cloud_id = ?;', [cloud_id]);

  // return formatBytes(Number(result.total || "0"));
  return result.total || '0';
}
