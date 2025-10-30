import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { sendLog } from './send-logs';

/**
 * Remove arquivos com extensões especificadas de um diretório.
 * @param {string} directory - O diretório onde os arquivos serão removidos.
 * @param {string[]} extensions - Um array de extensões de arquivos a serem removidos.
 * @returns {Promise<{ success: boolean, error?: string }>} - Uma promessa que retorna um objeto indicando se a remoção foi bem-sucedida ou não, e um erro caso ocorra.
 **/
export async function removeFiles(
  directory: string,
  extensions: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const files = await fs.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileExtension = path.extname(file);

      if (extensions.includes(fileExtension)) {
        try {
          await fs.unlink(filePath);
          sendLog(`arquivo removido: ${filePath}`);
        } catch (err: any) {
          sendLog(`Erro ao remover o arquivo ${filePath}: ${err.message}`);
          console.error(`Erro ao remover o arquivo ${filePath}: ${err.message}`);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao ler o diretório: ${error.message}`);
    return { success: false, error: error.message };
  }
}
