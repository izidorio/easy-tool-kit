import { ipcMain } from 'electron';
import { openDb, Database } from '../../database/database';
import { createReadStream } from 'node:fs';
import csv from 'csv-parser';
import iconv from 'iconv-lite';

interface Target {
  dsid: string;
  email?: string;
  alvo: string;
}

ipcMain.handle('ipc-target-import-csv', async (_, path: string) => {
  let db: Database;
  try {
    db = await openDb();
    const targets = await readCSV<Target>(path);

    //validar se o csv possui os campos necessários
    if (!targets.every((target) => target.dsid && target.alvo)) {
      return {
        error: 'O CSV não possui as colunas "dsid" e "alvo".',
        targets,
      };
    }

    const targetParsed = targets.map((target) => ({
      ds_id: target.dsid,
      email: target.email,
      alvo: target.alvo.toLocaleUpperCase(),
    }));

    for (const target of targetParsed) {
      if (target.ds_id !== '') {
        await db.run('INSERT OR REPLACE INTO targets (name, email, ds_id) VALUES (?, ?, ?)', [
          target.alvo,
          target.email,
          target.ds_id,
        ]);
      }
    }

    return { success: true };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Erro desconhecido' };
  }
});

function readCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    const stream = createReadStream(filePath);

    stream
      .pipe(iconv.decodeStream('utf8'))
      .pipe(
        csv({
          separator: ',',
          quote: '"',
        })
      )
      .on('data', (data) => {
        const cleanData = {
          dsid: data.dsid?.trim(),
          email: data.email?.trim(),
          alvo: data.alvo?.trim(),
        };

        results.push(cleanData as T);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
