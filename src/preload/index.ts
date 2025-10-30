import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Account, Cloud, Link, Settings, Target } from '../types';

// Custom APIs for renderer
export const api = {
  handleDownloadCloudByAccountId: (accountId: number): Promise<void> =>
    electronAPI.ipcRenderer.invoke('ipc-cloud-download-by-account-id', accountId),
  /**@deprecated use handleDownloadCloudByAccountId instead */
  downloadCloud: (confidentialId: string): Promise<void> =>
    electronAPI.ipcRenderer.invoke('ipc-cloud-download', confidentialId),
  getAllAccountsByCloudId: (id: string | undefined): Promise<any> =>
    ipcRenderer.invoke('ipc-accounts-get-all-by-cloud-id', id),
  getCloudById: (id: number): Promise<Cloud> => ipcRenderer.invoke('ipc-cloud-get-by-id', id),
  getAccountById: (id: string): Promise<{ account: Account; links: Link[] }> =>
    ipcRenderer.invoke('ipc-account-get-by-id', id),
  selectFile: (filters: Electron.FileFilter[]): Promise<string> => ipcRenderer.invoke('select-file', filters),
  selectDirectory: (): Promise<string> => ipcRenderer.invoke('select-directory'),
  discoveryAccounts: (id: number, data: Cloud & { reset: boolean }): Promise<any> =>
    ipcRenderer.invoke('ipc-accounts-discovery', id, data),
  updateCloud: (id: number, data: Cloud): Promise<any> => ipcRenderer.invoke('update-cloud', id, data),
  createCloudDraft: (): Promise<number> => ipcRenderer.invoke('ipc-cloud-create-draft'),
  getAllClouds: (): Promise<Cloud[]> => ipcRenderer.invoke('ipc-clouds-get-all'),
  deleteCloud: (id: number): Promise<boolean> => ipcRenderer.invoke('ipc-cloud-delete', id),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('ipc-settings-get'),
  setSettings: (data: Settings): Promise<Settings> => ipcRenderer.invoke('ipc-settings-set', data),
  exportAccounts: (directoryPath: string, data: any): Promise<any> =>
    ipcRenderer.invoke('ipc-accounts-export', directoryPath, data),
  handleIped: (data: { output_dir: string; email: string; ds_id: string }): Promise<any> =>
    ipcRenderer.invoke('ipc-handle-iped', data),
  handleDownloadFailed: (data: { output_dir: string; email: string; confidential_id: string }): Promise<any> =>
    ipcRenderer.invoke('ipc-handle-download-failed', data),
  getAllTargets: (): Promise<any> => ipcRenderer.invoke('ipc-targets-get-all'),
  createTarget: (data: Target): Promise<any> => ipcRenderer.invoke('ipc-target-create', data),
  updateTarget: (id: number, data: Target): Promise<any> => ipcRenderer.invoke('ipc-target-update', id, data),
  importTarget: (path: any): Promise<any> => ipcRenderer.invoke('ipc-target-import-csv', path),
  exportTargets: (directoryPath: string): Promise<any> => ipcRenderer.invoke('ipc-targets-export-csv', directoryPath),

  onProgress: (callback: (progress: any) => void) => ipcRenderer.on('progress', (_, progress) => callback(progress)),
  watchLog: (callback: (_, log: string) => void) => ipcRenderer.on('log', callback),
  watchProgress: (callback: (_, log: string) => void) => ipcRenderer.on('progress', callback),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
