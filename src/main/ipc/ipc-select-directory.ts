import { dialog, ipcMain } from "electron";

ipcMain.handle("select-directory", async (): Promise<string> => {
	const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
	return result.filePaths[0]; // Retorna o caminho do diretório selecionado
});
