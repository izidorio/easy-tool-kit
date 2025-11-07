import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { sendLog } from './send-logs';

export async function downloadLink(url: string, outputFile: string) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = createWriteStream(outputFile);
    sendLog(`Downloading ${url}`);

    return new Promise<void>((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', (err) => {
        console.error(`Erro ao escrever o arquivo ${outputFile}:`, err);
        reject(err);
      });
    });
  } catch (error) {
    sendLog(`Erro ao baixar o link ${url}.`);
    console.error(`Erro ao baixar o link ${url}:`, error);
    throw error;
  }
}
