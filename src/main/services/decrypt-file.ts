import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  openSync,
  readSync,
  closeSync,
} from 'node:fs';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import * as openpgp from 'openpgp';
import { sendLog } from './send-logs';
import fs from 'node:fs';

const ARMOR_HEADER = '-----BEGIN PGP ';
const ARMOR_HEADER_BYTES = 15;

/** Lê só os primeiros bytes do arquivo para detectar formato (armored vs binário). */
function readFirstBytes(filePath: string, length: number): Buffer {
  const fd = openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(length);
    const n = readSync(fd, buf, 0, length, 0);
    return n < length ? buf.subarray(0, n) : buf;
  } finally {
    closeSync(fd);
  }
}

/** Cria um ReadableStream<string> do conteúdo armored do arquivo (streaming, sem string gigante). */
function createArmoredMessageStream(filePath: string): ReadableStream<string> {
  const head = readFirstBytes(filePath, ARMOR_HEADER_BYTES);
  const restStream = createReadStream(filePath, { start: ARMOR_HEADER_BYTES });

  const binaryStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(head));
      restStream.on('data', (chunk: string | Buffer) => {
        const bytes =
          typeof chunk === 'string'
            ? new TextEncoder().encode(chunk)
            : new Uint8Array(chunk);
        controller.enqueue(bytes);
      });
      restStream.on('end', () => controller.close());
      restStream.on('error', (err) => controller.error(err));
    },
  });

  const decoder = new TextDecoder();
  return binaryStream.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        controller.enqueue(decoder.decode(chunk, { stream: true }));
      },
      flush(controller) {
        const tail = decoder.decode();
        if (tail) controller.enqueue(tail);
      },
    })
  );
}

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
    const head = readFirstBytes(filePath, ARMOR_HEADER_BYTES);
    const isArmored =
      head.length >= ARMOR_HEADER_BYTES &&
      head.toString('ascii') === ARMOR_HEADER;

    const message = isArmored
      ? await openpgp.readMessage({
          armoredMessage: createArmoredMessageStream(filePath),
        })
      : await openpgp.readMessage({
          binaryMessage: new Uint8Array(readFileSync(filePath)),
        });

    const { data: decryptedData } = await openpgp.decrypt({
      message,
      passwords: [passphrase],
      format: 'binary',
    });

    const outputPath = output_dir + '.zip';
    if (decryptedData instanceof Uint8Array) {
      writeFileSync(outputPath, Buffer.from(decryptedData));
    } else {
      // openpgp retorna Web ReadableStream; Node Readable.fromWeb aceita em runtime
      const nodeStream = Readable.fromWeb(decryptedData as Parameters<typeof Readable.fromWeb>[0]);
      await pipeline(
        nodeStream,
        createWriteStream(outputPath)
      );
    }

    sendLog(`arquivo descriptografado com sucesso: ${output_dir}`);
    if (remove_gpg) {
      fs.unlinkSync(filePath);
      sendLog(`arquivo excluído com sucesso: ${output_dir}`);
    }
  } catch (error: any) {
    sendLog(`erro ao descriptografar o arquivo: ${error.message}`);
    console.error('Erro ao descriptografar o arquivo:', error.message);
    throw new Error(`Erro ao descriptografar o arquivo: ${error.message}`);
  }
}
