import { ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { createDirectoryIfNotExists } from '../services';
import { openDb } from '../../database/database';

interface HandleIpedProps {
  ds_id: string;
  output_dir: string;
  email: string;
}

ipcMain.handle('ipc-handle-iped', async (_, { output_dir, email, ds_id }: HandleIpedProps) => {
  console.log({ output_dir, email, ds_id });

  try {
    const db = await openDb();
    const settings = await db.get('SELECT iped_path FROM settings LIMIT 1');
    const account = await db.get(
      'SELECT t.name FROM accounts a LEFT JOIN targets t ON a.ds_id = t.ds_id WHERE a.ds_id = ?',
      ds_id
    );

    if (!settings || !settings.iped_path) {
      return new Error('Caminho do IPED não configurado. Configure o caminho do IPED nas configurações.');
    }

    const nuvemDir = path.join(output_dir, email, 'nuvem');
    const outputDir = path.join(output_dir, '_indexadas', account.name ? `${account.name}-${email}` : email);

    const files = fs.readdirSync(nuvemDir);
    const hasFailedDownloads = files.some((file) => file.startsWith('download_failed_') && file.endsWith('.txt'));

    if (hasFailedDownloads) {
      return { success: true, message: 'Antes de Processar você precisa resolver os downloads falhos.' };
    }

    createDirectoryIfNotExists(outputDir);

    const command = `"${settings.iped_path}" -d "${nuvemDir}" -o "${outputDir}" --downloadInternetData --portable`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar IPED: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`IPED stderr: ${stderr}`);
      }
      console.log(`IPED stdout: ${stdout}`);

      //TODO: criar um arquivo .txt com a mensagem de sucesso
      fs.writeFileSync(
        path.join(output_dir, email, 'iped_concluido_com_sucesso_resultado_salvo_na_pasta_indexadas.txt'),
        `IPED executado com sucesso. Resultado criado na pasta ${output_dir}_indexadas`
      );
    });

    return true;
  } catch (error) {
    console.error('Erro ao processar com IPED:', error);
    return new Error('Erro ao processar com IPED');
  }
});
