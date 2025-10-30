import { readFileSync, writeFileSync } from 'node:fs';
import * as openpgp from 'openpgp';
import { sendLog } from './send-logs';
import fs from 'node:fs';

/**
 * Decrypts a file .gpg using the provided passphrase.
 * @param {string} filePath - The path to the file to be decrypted.
 * @param {string} output_dir - The output directory where the decrypted file will be saved.
 * @param {string} passphrase - The passphrase used for decryption.
 * @returns {Promise<void>} A promise that resolves when the decryption is complete.
 * @throws {Error} If there is an error during decryption.
 * @example
 * decryptFile("input.txt", "output.txt", "myPassphrase");
 **/
export async function decryptFile(
  filePath: string,
  output_dir: string,
  passphrase: string,
  remove_gpg: boolean = false
) {
  try {
    const fileData = readFileSync(filePath, 'utf8');
    const message = await openpgp.readMessage({ armoredMessage: fileData });

    const { data: decryptedData } = await openpgp.decrypt({
      message,
      passwords: [passphrase],
      format: 'binary',
    });

    writeFileSync(output_dir + '.zip', Buffer.from(decryptedData));
    //writeFileSync(output_dir, Buffer.from(decryptedData));

    sendLog(`arquivo descriptografado com sucesso: ${output_dir}`);
    if (remove_gpg) {
      fs.unlinkSync(filePath);
      sendLog(`arquivo excluído com sucesso: ${output_dir}`);
    }
  } catch (error: any) {
    sendLog(`erro ao descriptografar o arquivo: ${error.message}`);
    console.error('Erro ao descriptografar o arquivo:', error.message);
  }
}
