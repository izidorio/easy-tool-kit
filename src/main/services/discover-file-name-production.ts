import { readDirectory } from './read-directory';
import { dirname } from 'node:path';

/**
 * Descobre o arquivo que termina com "account-download-details.csv" dentro da pasta descompactada.
 * @param {string} filePath - O caminho do arquivo que foi descompactado.
 * @returns {Promise<string>} - O caminho completo do arquivo CSV encontrado.
 * @throws {Error} - Lança um erro se o arquivo não for encontrado.
 */
export async function discoverFileNameProduction(filePath: string): Promise<string> {
  try {
    // Obtém o diretório onde o arquivo foi descompactado
    const outputDir = dirname(filePath);
    
    // Lista todos os arquivos recursivamente no diretório
    const allFiles = await readDirectory(outputDir);
    
    // Procura pelo arquivo que termina com "account-download-details.csv"
    const csvFile = allFiles.find(file => file.endsWith('account-download-details.csv'));
    
    if (!csvFile) {
      throw new Error(`Arquivo "account-download-details.csv" não encontrado em ${outputDir}`);
    }
    
    return csvFile;
  } catch (error: any) {
    throw new Error(`Erro ao descobrir arquivo de produção: ${error.message}`);
  }
}
