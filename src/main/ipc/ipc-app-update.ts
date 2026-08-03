import { app, ipcMain } from 'electron';
import { is } from '@electron-toolkit/utils';
import { applyAppUpdate, checkAppUpdate } from '../services';
import { getMainWindow } from '../main-window';
import { getAppUpdateLogPath, logAppUpdate } from '../services/app-update-log';
import type { AppUpdateCheckResult, AppUpdateProgress } from '../../types/app-update';

function sendProgress(progress: AppUpdateProgress): void {
  const mainWindow = getMainWindow();
  mainWindow?.webContents.send('app-update-progress', progress);
}

ipcMain.handle('ipc-app-update-check', async (): Promise<AppUpdateCheckResult> => {
  logAppUpdate(`IPC check solicitado. is.dev=${is.dev} app.isPackaged=${app.isPackaged}`);

  try {
    const result = await checkAppUpdate();
    logAppUpdate(`IPC check OK: ${JSON.stringify(result)}`);
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao verificar atualizações.';
    logAppUpdate(`IPC check ERRO: ${message}`);
    if (error instanceof Error && error.stack) {
      logAppUpdate(error.stack);
    }
    return {
      updateAvailable: false,
      currentVersion: app.getVersion(),
      latestVersion: app.getVersion(),
      releaseName: '',
      releaseNotes: '',
      downloadUrl: '',
      error: message,
    };
  }
});

ipcMain.handle(
  'ipc-app-update-download',
  async (_event, payload: { downloadUrl: string; latestVersion: string }): Promise<void | Error> => {
    logAppUpdate(`IPC download solicitado para versão ${payload.latestVersion} (isPackaged=${app.isPackaged})`);

    if (!app.isPackaged) {
      return new Error(
        'Instalação/atualização automática só funciona no aplicativo empacotado (easy-tool-kit.exe do ZIP).'
      );
    }

    try {
      logAppUpdate(`URL de download: ${payload.downloadUrl}`);
      await applyAppUpdate(payload.downloadUrl, payload.latestVersion, sendProgress);
      logAppUpdate('Apply concluído no main (app deve reiniciar em instantes).');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao baixar ou aplicar a atualização.';
      logAppUpdate(`IPC download ERRO: ${message}`);
      return new Error(message);
    }
  }
);

ipcMain.handle('ipc-app-get-version', (): string => app.getVersion());

ipcMain.handle('ipc-app-update-log-path', (): string => getAppUpdateLogPath());

ipcMain.handle('ipc-app-update-log', (_event, message: string): void => {
  logAppUpdate(`[renderer] ${message}`);
});
