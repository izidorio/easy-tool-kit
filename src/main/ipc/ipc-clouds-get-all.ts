import { ipcMain } from 'electron';

import { Cloud } from '../../types';
import { openDb } from '../../database/database';

ipcMain.handle('ipc-clouds-get-all', async () => {
  try {
    return await getAllClouds();
  } catch (error: any) {
    return new Error('Erro ao ler nuvens', error?.message);
  }
});

async function getAllClouds(): Promise<Cloud[]> {
  const db = await openDb();
  return db.all('SELECT * FROM clouds ORDER BY name ASC;');
}
