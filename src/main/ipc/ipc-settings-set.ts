import { ipcMain } from 'electron';

import { openDb } from '../../database/database';
import { Settings } from '../../types';

ipcMain.handle('ipc-settings-set', async (_, data: Settings): Promise<boolean | Error> => {
  try {
    const db = await openDb();
    const result = await db.get<{ id: number }>('SELECT id FROM settings limit 1');

    if (result && result.id) {
      await db.run('UPDATE settings SET bash_path=?, iped_path=? WHERE 1=1;', [data.bash_path, data.iped_path]);
      return true;
    }

    return new Error('Erro ao criar uma nuvem rascunho');
  } catch (error: any) {
    return new Error('Erro ao criar uma nuvem rascunho', error?.message);
  }
});
