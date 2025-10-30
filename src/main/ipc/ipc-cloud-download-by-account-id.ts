import { ipcMain } from 'electron';
import { exec } from 'node:child_process';
import path, { join } from 'node:path';
import { openDb } from '../../database/database';

import { Settings } from '../../types';
import fs from 'node:fs';
import { createCsvLinks } from '../services/create-csv-links';

ipcMain.handle('ipc-cloud-download-by-account-id', async (_, accountId: string) => {
  const db = await openDb();
  const account = await db.get('SELECT * FROM accounts WHERE id = ?', accountId);
  const cloud = await db.get('SELECT * FROM clouds WHERE id = ?', account.cloud_id);
  const links = await db.all('SELECT * FROM links WHERE account_id = ?', account.id);
  const settings = await db.get<Settings>('SELECT * FROM settings limit 1');

  await db.run('UPDATE accounts SET status = ? WHERE id = ?', ['downloading', account.id]);

  const output_dir = path.join(cloud.output_dir, account.email);
  createDirectoryIfNotExists(output_dir);
  createDirectoryIfNotExists(join(output_dir, 'nuvem'));

  await createCsvLinks({ output_dir, links, fileName: 'links.csv' });
  await copyFile(join('.', '_down.bash'), join(output_dir, '_down.bash'));

  //const pathGitBash = 'C:\\Program Files\\Git\\git-bash.exe';
  //const _bashCommand = `cd /c/Users/Public/Documents/Apple_5Q-F1-MACAW/crvaladares@gmail.com && bash ./_down.bash '${cloud.password}' links.csv ./nuvem`;
  const pathGitBash = settings!.bash_path;
  const bashCommand = `cd ${output_dir} && bash ./_down.bash '${cloud.password}' links.csv ./nuvem`;
  const cmd = `"${pathGitBash}" -c "${bashCommand.replaceAll('\\', '/')}"`;

  //cmd "C:\Program Files\Git\git-bash.exe" -c "cd /c/Users/Public/Documents/Apple_5Q-F1-MACAW/crvaladares@gmail.com && bash ./_down.bash 'OGxcqhzk@tVcJ6G9uW*!' l

  // const pathPowerShell = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  // const cmd = `start ${pathPowerShell} -NoExit -Command "& {cd ${output_dir}; bash ./_down.bash '${cloud.password}' links.csv ./nuvem}"`;

  // Log file path
  const logFilePath = path.join('.', 'execution.log');

  // fs.appendFileSync(logFilePath, `Command: ${cmd}\n`);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      fs.appendFileSync(logFilePath, `Error: ${err.message}\n`);
      console.error(err);
      return;
    }

    fs.appendFileSync(logFilePath, `stdout: ${stdout}\n`);
    fs.appendFileSync(logFilePath, `stderr: ${stderr}\n`);
    console.log(stdout);
    console.error(stderr);
  });
});

//bash ./get_decrypt_extract.bash 'OGxcqhzk@tVcJ6G9uW*!' links.csv ./

function copyFile(src: string, dest: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

const createDirectoryIfNotExists = (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true }); // `recursive: true` cria diretórios pai se não existirem
  }
};

//"Data_Type","File_Name","File_Link","File_Type","GPG_Size","GPG_SHA256","Link Expiry Date"
