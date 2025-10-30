import { ipcMain } from 'electron';
import { openDb } from '../../database/database';

ipcMain.handle('ipc-targets-get-all', async () => {
  const db = await openDb();
  const targets = await db.all('SELECT * FROM targets');
  return targets;
});
