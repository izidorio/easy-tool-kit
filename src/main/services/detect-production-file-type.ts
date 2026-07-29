import { closeSync, openSync, readSync } from 'node:fs';

const ARMOR_HEADER = '-----BEGIN PGP ';
const ARMOR_HEADER_BYTES = 15;

export type ProductionFileType = 'zip' | 'gpg';

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

/**
 * Detecta se o arquivo de produção baixado é ZIP ou GPG pelos magic bytes.
 */
export function detectProductionFileType(filePath: string): ProductionFileType {
  const head = readFirstBytes(filePath, ARMOR_HEADER_BYTES);

  if (head.length >= 2 && head[0] === 0x50 && head[1] === 0x4b) {
    return 'zip';
  }

  if (
    head.length >= ARMOR_HEADER_BYTES &&
    head.toString('ascii') === ARMOR_HEADER
  ) {
    return 'gpg';
  }

  if (head.length >= 1 && (head[0] & 0x80) === 0x80) {
    return 'gpg';
  }

  throw new Error('tipo de arquivo não suportado');
}
