import { ipcMain } from 'electron';
import { openDb } from '../../database/database';

ipcMain.handle('ipc-account-get-by-id', async (_, id: number) => {
  try {
    return await getAccountCloudById(id);
  } catch (error: any) {
    return new Error('Erro ao ler uma conta. id inexistente ou removido', error?.message);
  }
});

async function getAccountCloudById(id: number): Promise<any | undefined> {
  const db = await openDb();
  const account = await db.get(
    'SELECT c.id as cloud_id, c.name as cloud_name, a.* FROM accounts a LEFT JOIN clouds c ON a.cloud_id = c.id WHERE a.id = ?',
    [id]
  );

  if (!account) {
    return [];
  }

  const links = await db.all('SELECT * FROM links WHERE account_id = ?', [account.id]);

  //TODO atualizar o total de links baixados e não baixados
  account.total_links = links.length;
  account.downloaded_links = links.filter((link) => link.status === 'downloaded').length || 0;

  await db.run('UPDATE accounts SET total_links = ?, downloaded_links = ? WHERE id = ?', [
    account.total_links,
    account.downloaded_links,
    account.id,
  ]);

  return { account, links };
}
