import { ipcMain } from 'electron';
import { openDb } from '../../database/database';

ipcMain.handle('ipc-accounts-get-all-by-cloud-id', async (_, id: number) => {
  try {
    return await getAccountById(id);
  } catch (error: any) {
    return new Error('Erro ao ler nuvem. id inexistente ou removido', error?.message);
  }
});

async function getAccountById(id: number): Promise<any> {
  const db = await openDb();

  const accounts = await db.all(
    `SELECT c.id as cloud_id, c.name as cloud_name, c.output_dir as output_dir, t.name as target_name, a.* FROM accounts a
     LEFT JOIN clouds c ON a.cloud_id = c.id 
     LEFT JOIN targets t ON a.ds_id = t.ds_id
     WHERE a.cloud_id = ?`,
    [id]
  );

  const result: any = [];

  for (const account of accounts) {
    const links = await db.all(`SELECT * FROM links WHERE confidential_id = ?`, [account.confidential_id]);

    account.links = links;
    result.push(account);
  }

  return result;
}
