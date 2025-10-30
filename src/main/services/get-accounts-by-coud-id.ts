import { openDb } from '../../database/database';
import { Link } from '../../types';

export async function getAccountsByCloudId(cloud_id: number): Promise<Link[]> {
  const db = await openDb();

  const result = await db.all("SELECT * FROM links WHERE Data_Type = 'Account Information' AND cloud_id = ?;", [
    cloud_id,
  ]);

  //TODO: atualizar o total de contas da nuvem
  await db.run('UPDATE clouds SET accounts_total = ? WHERE id = ?', [result.length, cloud_id]);
  return result;
}
