import { BrowserWindow } from "electron";

export function sendLog(message: string) {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    mainWindow.webContents.send("log", message);
  }
}
