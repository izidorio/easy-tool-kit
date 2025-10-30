import { ipcMain } from 'electron';
import { openDb } from '../../database/database';
import { Target } from '../../types';

ipcMain.handle('ipc-target-update', async (_, id: number, data: Target) => {
  try {
    const db = await openDb();

    //VALIDAR SE O ID ´JÁ FOI UTILIZADO
    const idDsIdUsed = await db.get('SELECT id FROM targets WHERE ds_id = ? AND id != ?', [data.ds_id, id]);
    if (idDsIdUsed) {
      return { error: 'o DS ID já foi utilizado' };
    }

    const result = await db.run(
      'UPDATE targets SET name = ?, alias = ?, ds_id = ?, document = ?, analyst = ?, email = ? WHERE id = ?',
      [data.name, data.alias, data.ds_id, data.document, data.analyst, data.email, id]
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Erro desconhecido' };
  }
});
