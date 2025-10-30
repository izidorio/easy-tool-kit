import axios from 'axios';
import path from 'node:path';
import fs from 'node:fs';
import { BrowserWindow } from 'electron';
import { openDb } from '../../database/database';
import { sendLog } from './send-logs';
import { WorkQueue } from '../../types';
import { decryptFile, formatBytes, sendProgress } from '../services';

const createDirectoryIfNotExists = (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true }); // `recursive: true` cria diretórios pai se não existirem
  }
};

const downloadFile = async (wq: WorkQueue, output_dir: string): Promise<string> => {
  try {
    sendLog(`baixando: ${wq.file_name} - ${wq.email}`);
    const response = await axios({
      method: 'get',
      url: wq.url,
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        sendProgress(
          `progresso: ${((progressEvent.loaded / wq.gpg_size) * 100).toFixed(2)}% - ${wq.file_name} ${formatBytes(
            wq.gpg_size
          )}`
        );
      },
    });

    createDirectoryIfNotExists(path.join(output_dir, wq.email));

    const filePath = path.join(output_dir, wq.email, wq.file_name);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        sendLog(`Download concluído: ${wq.file_name}`);
        resolve(filePath);
      });
      writer.on('error', (err) => {
        console.error(`Erro ao baixar o arquivo ${wq.file_name}:`, err);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Erro ao processar o download:`, error);
    throw error;
  }
};

export const processQueue = async () => {
  const queue: WorkQueue[] = []; // Fila de URLs a serem baixadas

  sendLog('processando fila...');

  const db = await openDb();
  // Usar a função all para obter todas as linhas pendentes
  const rows = await db.all("SELECT * FROM work_queue WHERE status = 'pending'");

  const cloud = await db.get('SELECT * FROM clouds WHERE id = ?', [rows[0].cloud_id]);

  for (const row of rows) {
    queue.push(row);
  }

  for (const wc of queue) {
    try {
      const filePath = await downloadFile(wc, cloud.output_dir);

      db.run("UPDATE work_queue SET status = 'completed' WHERE id = ?", wc.id);

      decryptFile(filePath, filePath, cloud.password, true);

      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send('progress', wc.id);
      }

      sendLog(`arquivo baixado: ${wc.file_name}`);
    } catch (err: any) {
      console.error(`Failed to download ${wc.file_name}: ${err.message}`);
      sendLog(`erro ao baixar: ${wc.file_name}`);
    }
  }
};
