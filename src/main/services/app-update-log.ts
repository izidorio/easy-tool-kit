import { app } from 'electron';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { sendLog } from './send-logs';

const LOG_FILE_NAME = 'easy-tool-kit-update.log';

function getLogFilePath(): string {
  const baseDir = app.isPackaged ? dirname(process.execPath) : process.cwd();
  return join(baseDir, LOG_FILE_NAME);
}

function formatLine(message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [auto-update] ${message}`;
}

export function getAppUpdateLogPath(): string {
  return getLogFilePath();
}

export function logAppUpdate(message: string): void {
  const line = formatLine(message);
  console.log(line);

  try {
    const logPath = getLogFilePath();
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${line}\n`, 'utf8');
  } catch (error) {
    console.error('Falha ao gravar log de auto-update:', error);
  }

  sendLog(line);
}
