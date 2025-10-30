import * as fs from "node:fs/promises";
import * as path from "node:path";
import { sendLog } from "./send-logs";

/**
 * Remove todos os arquivos e subdiretórios dentro de um diretório, mas mantém o diretório informado.
 * @param {string} directory - O diretório cujo conteúdo será removido.
 * @returns {Promise<{ success: boolean, error?: string }>} - Uma promessa que retorna um objeto indicando se a remoção foi bem-sucedida ou não, e um erro caso ocorra.
 **/
export async function clearDirectory(
  directory: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const items = await fs.readdir(directory, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(directory, item.name);

      if (item.isDirectory()) {
        await removeDirectory(itemPath); // Recursively remove subdirectory and its contents
      } else {
        await fs.unlink(itemPath); // Remove file
      }
    }

    sendLog(`Removido o conteúdo do diretório: ${directory}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao limpar o diretório: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Remove um diretório e todos os seus subdiretórios e arquivos.
 * @param {string} directory - O diretório a ser removido.
 * @returns {Promise<{ success: boolean, error?: string }>} - Uma promessa que retorna um objeto indicando se a remoção foi bem-sucedida ou não, e um erro caso ocorra.
 **/
async function removeDirectory(
  directory: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const items = await fs.readdir(directory, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(directory, item.name);

      if (item.isDirectory()) {
        await removeDirectory(itemPath); // Recursively remove subdirectory
      } else {
        await fs.unlink(itemPath); // Remove file
      }
    }

    await fs.rmdir(directory); // Remove the empty directory itself

    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao remover o diretorio: ${error.message}`);
    return { success: false, error: error.message };
  }
}
