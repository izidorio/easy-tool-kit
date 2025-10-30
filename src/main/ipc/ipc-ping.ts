import { ipcMain } from "electron";

// IPC test
ipcMain.on("ping", () => console.log("pong"));
