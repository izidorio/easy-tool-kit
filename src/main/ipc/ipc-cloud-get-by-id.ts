import { ipcMain } from 'electron';
import { openDb } from '../../database/database';
import { Cloud } from '../../types';

ipcMain.handle('ipc-cloud-get-by-id', async (_, id: number) => {
  try {
    return await getCloudById(id);
  } catch (error: any) {
    return new Error('Erro ao ler nuvem. id inexistente ou removido', error?.message);
  }
});

async function getCloudById(id: number): Promise<Cloud | undefined> {
  const db = await openDb();
  return db.get('SELECT * FROM clouds WHERE id = ?', [id]);
}
