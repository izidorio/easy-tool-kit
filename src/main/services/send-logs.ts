import { BrowserWindow } from "electron";
import {  is } from '@electron-toolkit/utils';
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export function sendLog(message: string) {
  if (is.dev) {
    console.log(message);
    //TODO: escrever os logs em um arquivo ../../logs.txt
    // escrever linha a linha ir adicionando uma linha com um novo registro de log
    writeFileSync(join(__dirname, '../../logs.txt'), message + '\n', { flag: 'a' });
  }
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    mainWindow.webContents.send("log", message);
  }
}
