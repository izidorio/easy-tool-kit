import { ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { openDb } from '../../database/database';
import { createCsvLinks } from '../services/create-csv-links';
import { Settings } from '../../types';
import { exec } from 'node:child_process';

interface HandleDownloadFailedProps {
  output_dir: string;
  email: string;
  confidential_id: string;
}

// Verificar se existe na pasta nuvem um arquivo download_failed_*.txt
ipcMain.handle(
  'ipc-handle-download-failed',
  async (_, { output_dir, email, confidential_id }: HandleDownloadFailedProps) => {
    const emailDir = path.join(output_dir, email);
    const nuvemDir = path.join(output_dir, email, 'nuvem');
    const db = await openDb();

    const files = fs.readdirSync(nuvemDir);
    const hasFailedDownloads = files.some((file) => file.startsWith('download_failed_') && file.endsWith('.txt'));

    if (!hasFailedDownloads) {
      return { success: true, message: 'Não há nenhum download falho.' };
    }

    if (hasFailedDownloads) {
      const settings = await db.get<Settings>('SELECT * FROM settings limit 1');
      const links = await db.all('SELECT * FROM links WHERE confidential_id = ?', confidential_id);
      const cloud = await db.get('SELECT * FROM clouds WHERE id = ?', links[0].cloud_id);

      const [failedLinks] = fs
        .readdirSync(nuvemDir)
        .filter((file) => file.startsWith('download_failed_') && file.endsWith('.txt'));

      const failedLinksContent = fs.readFileSync(path.join(nuvemDir, failedLinks), 'utf8');
      const _failedLinksContent = failedLinksContent.split('\n');

      const failedLinksFiltered = links.filter((link) => _failedLinksContent.includes(link.file_link));

      await createCsvLinks({
        output_dir: emailDir,
        links: failedLinksFiltered,
        fileName: 'links_failed.csv',
      });

      const pathGitBash = settings!.bash_path;
      const bashCommand = `cd ${emailDir} && bash ./_down.bash '${cloud.password}' links_failed.csv ./nuvem`;
      const cmd = `"${pathGitBash}" -c "${bashCommand.replaceAll('\\', '/')}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar CMD: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`CMD stderr: ${stderr}`);
        }
        console.log(`CMD stdout: ${stdout}`);
        fs.unlink(path.join(nuvemDir, failedLinks), (err) => {
          if (err) {
            console.error(`Erro ao remover arquivo: ${err.message}`);
          }
        });
      });
    }

    return { success: false, message: '' };
  }
);
