import { BrowserWindow, ipcMain } from "electron";

// toggle always on top
ipcMain.handle("toggle-always-on-top", async () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
    return mainWindow.isAlwaysOnTop();
  }
  return { status: 500, message: "window not found" };
});

ipcMain.handle("get-status-always-on-top", async () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    return mainWindow.isAlwaysOnTop();
  }
  return { status: 500, message: "window not found" };
});
