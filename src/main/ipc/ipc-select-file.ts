import { dialog, ipcMain } from "electron";

ipcMain.handle(
  "select-file",
  async (_, filters: Electron.FileFilter[]): Promise<string> => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters,
    });
    return result.filePaths[0]; // Retorna o caminho do arquivo selecionado
  }
);
