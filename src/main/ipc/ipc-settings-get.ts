import { ipcMain } from 'electron';

import { openDb } from '../../database/database';
import { Settings } from '../../types';

ipcMain.handle('ipc-settings-get', async (): Promise<Settings | undefined | Error> => {
  try {
    const db = await openDb();
    const result = await db.get<Settings>('SELECT * FROM settings limit 1');

    if (result) {
      return result;
    }

    await db.run('INSERT INTO settings (bash_path, iped_path) VALUES (?, ?);', [
      'C:\\Program Files\\Git\\git-bash.exe',
      '',
    ]);

    return {
      bash_path: 'C:\\Program Files\\Git\\git-bash.exe',
      iped_path: '',
    };
  } catch (error: any) {
    return new Error('Erro ao criar uma nuvem rascunho', error?.message);
  }
});
