import path, { join } from "path";
import AdmZip from "adm-zip";
import fs from "fs";

//TODO: fazer a descrição da função
/**
 * Descompacta um arquivo ZIP em um diretório específico.
 * @param {string} filePath - O caminho do arquivo ZIP a ser descompactado.
 * @returns {Promise<{ success: boolean, error?: string }>} - Uma promessa que retorna um objeto indicando se a descompactação foi bem-sucedida ou não, e um erro caso ocorra.
 * @throws {Error} - Lança um erro se o arquivo não puder ser lido ou se ocorrer um erro durante a descompactação.
 * @example
 * // Descompacta o arquivo ZIP em um diretório específico
 * await unzipFiles("caminho/para/arquivo.zip"); "saida: caminho/para/arquivo"
 **/
export async function unzipFile(filePath: string): Promise<string> {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    const outputDir = path.dirname(filePath);
    zip.extractAllTo(outputDir, true);

    return join(outputDir, zipEntries[0].entryName);
  } catch (error: any) {
    console.error(
      `Erro ao descompactar o arquivo: ${filePath}. Mensagem: ${error.message}`
    );
    throw new Error(`Erro ao descompactar o arquivo: ${error.message}`);
  }
}
