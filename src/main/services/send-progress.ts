import { BrowserWindow } from "electron";

export function sendProgress(message: string) {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    mainWindow.webContents.send("progress", message);
  }
}
