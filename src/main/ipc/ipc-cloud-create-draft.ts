import { ipcMain } from 'electron';

import { openDb } from '../../database/database';

ipcMain.handle('ipc-cloud-create-draft', async (): Promise<number | Error> => {
  try {
    const db = await openDb();

    const result = await db.get<{ lastID: number }>("SELECT id as lastID FROM clouds WHERE status = 'draft' limit 1");

    if (result) {
      return result.lastID;
    }

    const { lastID } = await db.run(
      "INSERT INTO clouds (name, status, created_at) VALUES ('draft', 'draft', strftime('%Y-%m-%d %H:%M:%S', 'now'));"
    );

    if (lastID) {
      return lastID;
    }

    return new Error('Erro ao criar uma nuvem rascunho');
  } catch (error: any) {
    return new Error('Erro ao criar uma nuvem rascunho', error?.message);
  }
});
