import { ipcMain } from 'electron';
import { openDb } from '../../database/database';
import { Target } from '../../types';

ipcMain.handle('ipc-target-create', async (_, data: Target) => {
  try {
    const db = await openDb();

    //VALIDAR SE O ID ´JÁ FOI UTILIZADO
    const idDsIdUsed = await db.get('SELECT id FROM targets WHERE ds_id = ?', [data.ds_id]);
    if (idDsIdUsed) {
      return { error: 'o DS ID já foi utilizado' };
    }

    const result = await db.run(
      'INSERT INTO targets (name, alias, ds_id, document, analyst, email) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.alias, data.ds_id, data.document, data.analyst, data.email]
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Erro desconhecido' };
  }
});
