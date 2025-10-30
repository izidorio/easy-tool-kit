import { ipcMain } from 'electron';
import { openDb } from '../../database/database';

ipcMain.handle('ipc-cloud-delete', async (_, id: number): Promise<boolean | Error> => {
  try {
    const db = await openDb();

    // Verificar se a nuvem existe
    const cloud = await db.get('SELECT id FROM clouds WHERE id = ?', [id]);

    if (!cloud) {
      return new Error('Nuvem não encontrada');
    }

    // Deletar a links, as contas e a nuvem
    await db.run('DELETE FROM links WHERE cloud_id = ?', [id]);
    await db.run('DELETE FROM accounts WHERE cloud_id = ?', [id]);
    const result = await db.run('DELETE FROM clouds WHERE id = ?', [id]);

    if (result && result.changes && result.changes > 0) {
      return true;
    }

    return new Error('Erro ao deletar a nuvem');
  } catch (error: any) {
    return new Error('Erro ao deletar a nuvem', error?.message);
  }
});
