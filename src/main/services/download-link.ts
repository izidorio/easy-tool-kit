import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';
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

/**
 * Extrai o nome do arquivo dos cabeçalhos HTTP
 */
function extractFileNameFromHeaders(headers: any): string | null {
  const contentDisposition = headers['content-disposition'];
  if (contentDisposition) {
    // Procura por filename= ou filename*= no cabeçalho
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      let fileName = filenameMatch[1].replace(/['"]/g, '');
      // Remove encoding se presente (ex: UTF-8''nome-arquivo)
      if (fileName.startsWith("UTF-8''")) {
        fileName = decodeURIComponent(fileName.substring(7));
      } else if (fileName.includes('%')) {
        fileName = decodeURIComponent(fileName);
      }
      return fileName;
    }
  }
  return null;
}

/**
 * Faz o download de um arquivo e salva com o nome original detectado automaticamente
 * @param url URL do arquivo para download
 * @param outputDir Diretório onde o arquivo será salvo
 * @returns Caminho completo do arquivo salvo
 */
export async function downloadLinkWithOriginalName(url: string, outputDir: string): Promise<string> {
  try {
    let fileName: string | null = null;

    // Tenta fazer uma requisição HEAD primeiro para obter os cabeçalhos sem baixar o arquivo
    try {
      const headResponse = await axios.head(url, {
        maxRedirects: 5,
        validateStatus: (status) => status < 400,
      });
      fileName = extractFileNameFromHeaders(headResponse.headers);
    } catch {
      // Se HEAD falhar, continuamos e tentamos obter do GET
    }

    // Se não encontrou no cabeçalho, tenta extrair da URL
    if (!fileName) {
      try {
        const urlPath = new URL(url).pathname;
        const urlFileName = urlPath.split('/').pop();
        if (urlFileName && urlFileName.includes('.')) {
          fileName = urlFileName;
        }
      } catch {
        // Se falhar, usa 'download' como padrão
      }
    }

    // Faz o download completo
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      maxRedirects: 5,
    });

    // Se ainda não temos o nome do arquivo, tenta obter dos cabeçalhos da resposta GET
    if (!fileName) {
      fileName = extractFileNameFromHeaders(response.headers);
    }

    // Se ainda não tem extensão, tenta detectar pelo Content-Type
    if (fileName && !fileName.includes('.')) {
      const contentType = response.headers['content-type'];
      if (contentType) {
        const extension = contentType.split('/')[1]?.split(';')[0];
        if (extension && extension !== 'octet-stream') {
          fileName = `${fileName}.${extension}`;
        }
      }
    }

    // Se ainda não encontrou nome, usa 'download' como padrão
    if (!fileName) {
      fileName = 'download';
    }

    const outputFile = join(outputDir, fileName);
    sendLog(`Downloading ${url} to ${outputFile}`);

    const writer = createWriteStream(outputFile);

    return new Promise<string>((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', () => resolve(outputFile));
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
