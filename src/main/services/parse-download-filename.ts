import { basename } from 'node:path';

const MAX_FILENAME_LENGTH = 255;

export type KnownProductionExtension = '.zip' | '.gpg';

function sanitizeFilename(name: string): string | undefined {
  let cleaned = name.replace(/[\x00-\x1f\x7f]/g, '').replace(/[/\\]/g, '');
  cleaned = basename(cleaned);
  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return undefined;
  }
  if (cleaned.length > MAX_FILENAME_LENGTH) {
    cleaned = cleaned.slice(0, MAX_FILENAME_LENGTH);
  }
  return cleaned;
}

function parseFilenameStar(contentDisposition: string): string | undefined {
  const match = contentDisposition.match(/filename\*\s*=\s*([^;]+)/i);
  if (!match) {
    return undefined;
  }
  const value = match[1].trim().replace(/^"|"$/g, '');
  const parts = value.split("''");
  const encoded = parts.length === 2 ? parts[1] : value;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return undefined;
  }
}

function parseFilenameQuoted(contentDisposition: string): string | undefined {
  const quoted = contentDisposition.match(/filename\s*=\s*"([^"]*)"/i);
  if (quoted) {
    return quoted[1];
  }
  const unquoted = contentDisposition.match(/filename\s*=\s*([^;\s]+)/i);
  if (unquoted) {
    return unquoted[1];
  }
  return undefined;
}

function filenameFromUrl(finalUrl: string): string | undefined {
  try {
    const pathname = new URL(finalUrl).pathname;
    const segment = basename(pathname);
    if (!segment || segment === '/') {
      return undefined;
    }
    return segment;
  } catch {
    return undefined;
  }
}

/**
 * Extrai nome de arquivo sugerido a partir de Content-Disposition e URL final.
 */
export function parseDownloadFilename(
  contentDisposition: string | undefined,
  finalUrl: string,
  _contentType?: string
): string | undefined {
  if (contentDisposition) {
    const fromStar = parseFilenameStar(contentDisposition);
    const sanitizedStar = fromStar ? sanitizeFilename(fromStar) : undefined;
    if (sanitizedStar) {
      return sanitizedStar;
    }

    const fromQuoted = parseFilenameQuoted(contentDisposition);
    const sanitizedQuoted = fromQuoted ? sanitizeFilename(fromQuoted) : undefined;
    if (sanitizedQuoted) {
      return sanitizedQuoted;
    }
  }

  const fromUrl = filenameFromUrl(finalUrl);
  return fromUrl ? sanitizeFilename(fromUrl) : undefined;
}

export function extensionFromFilename(
  name: string | undefined
): KnownProductionExtension | undefined {
  if (!name) {
    return undefined;
  }
  const lower = name.toLowerCase();
  if (lower.endsWith('.zip')) {
    return '.zip';
  }
  if (lower.endsWith('.gpg')) {
    return '.gpg';
  }
  return undefined;
}

export function productionTypeFromExtension(
  ext: KnownProductionExtension | undefined
): 'zip' | 'gpg' | undefined {
  if (ext === '.zip') {
    return 'zip';
  }
  if (ext === '.gpg') {
    return 'gpg';
  }
  return undefined;
}
