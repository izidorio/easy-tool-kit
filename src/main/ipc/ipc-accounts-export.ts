import { ipcMain } from 'electron';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'node:path';

ipcMain.handle('ipc-accounts-export', async (_, directoryPath: string, data: any[]) => {
  if (data && data.length === 0) {
    return false;
  }

  const cloud_name = data[0].cloud_name;
  try {
    const csvWriter = createObjectCsvWriter({
      path: path.join(directoryPath, `${cloud_name}.csv`),
      header: [
        { id: 'ds_id', title: 'DSID' },
        { id: 'target_name', title: 'Alvo' },
        { id: 'email', title: 'AppleId' },
        { id: 'cloud_size', title: 'Tamanho' },
        { id: 'expiry_date', title: 'Expira em' },
      ],
      //   alwaysQuote: true,
    });

    await csvWriter.writeRecords(data);
    return true;
  } catch (error) {
    throw error;
  }
});
