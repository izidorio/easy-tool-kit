import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { sendLog } from './send-logs';
import { parseDownloadFilename } from './parse-download-filename';

export type DownloadLinkResult = {
  outputFile: string;
  requestedUrl: string;
  finalUrl: string;
  suggestedFilename?: string;
  contentType?: string;
};

export async function downloadLink(
  url: string,
  outputFile: string
): Promise<DownloadLinkResult> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      maxRedirects: 10,
    });

    const finalUrl =
      (response.request as { res?: { responseUrl?: string } })?.res?.responseUrl ??
      response.config.url ??
      url;

    const contentDisposition = response.headers['content-disposition'];
    const contentType = response.headers['content-type'];
    const suggestedFilename = parseDownloadFilename(
      typeof contentDisposition === 'string' ? contentDisposition : undefined,
      finalUrl,
      typeof contentType === 'string' ? contentType : undefined
    );

    sendLog(`Downloading`);
    if (finalUrl !== url) {
      sendLog(`Link encurtado: ${url}`);
      sendLog(`Link real: ${finalUrl}`);
    }else{
      sendLog(`Link: ${finalUrl}`);
    }

    if (suggestedFilename) {
      sendLog(`Nome do arquivo baixado: ${suggestedFilename}`);
    }
    if (typeof contentType === 'string' && contentType.includes('text/html')) {
      sendLog('Aviso: Content-Type indica text/html; o link pode não ser um arquivo binário.');
    }

    const writer = createWriteStream(outputFile);

    await new Promise<void>((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', (err) => {
        console.error(`Erro ao escrever o arquivo ${outputFile}:`, err);
        reject(err);
      });
    });

    return {
      outputFile,
      requestedUrl: url,
      finalUrl,
      suggestedFilename,
      contentType: typeof contentType === 'string' ? contentType : undefined,
    };
  } catch (error) {
    sendLog(`Erro ao baixar o link ${url}.`);
    console.error(`Erro ao baixar o link ${url}:`, error);
    throw error;
  }
}
