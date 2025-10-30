import { ipcMain } from 'electron';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'node:path';
import { openDb } from '../../database/database';
ipcMain.handle('ipc-targets-export-csv', async (_, directoryPath: string) => {
  const db = await openDb();
  const data = await db.all('SELECT * FROM targets');

  try {
    const csvWriter = createObjectCsvWriter({
      path: path.join(directoryPath, `alvos_${new Date().getTime()}.csv`),
      header: [
        { id: 'ds_id', title: 'dsid' },
        { id: 'email', title: 'email' },
        { id: 'name', title: 'alvo' },
        { id: 'analyst', title: 'analista' },
      ],
      alwaysQuote: true,
    });

    await csvWriter.writeRecords(data);
    return true;
  } catch (error) {
    throw error;
  }
});
