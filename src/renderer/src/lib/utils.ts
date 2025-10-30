import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const units: { [key: string]: number } = {
  Bytes: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
};

export function formatBytes(totalBytes: number): string {
  // Para retornar em um formato legível
  if (totalBytes < units['KB']) return `${totalBytes} Bytes`;
  if (totalBytes < units['MB']) return `${(totalBytes / units['KB']).toFixed(2)} KB`;
  if (totalBytes < units['GB']) return `${(totalBytes / units['MB']).toFixed(2)} MB`;
  if (totalBytes < units['TB']) return `${(totalBytes / units['GB']).toFixed(2)} GB`;
  return `${(totalBytes / units['TB']).toFixed(3)} TB`;
}
