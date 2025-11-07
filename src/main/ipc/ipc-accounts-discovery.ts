import { ipcMain } from 'electron';

import { openDb } from '../../database/database';
import { Cloud, Link } from '../../types';
import { readCSV } from '../services/read-csv';
import { addLinks } from '../services/add-links';
import { getAccountsByCloudId } from '../services/get-accounts-by-coud-id';
import { downloadLink } from '../services/download-link';
import { join } from 'node:path';
import { decryptFile } from '../services/decrypt-file';
import { unzipFile } from '../services/unzip-file';
import { addAccount, createDirectoryIfNotExists, discoverFileNameProduction, readExcelCell, removeFiles } from '../services';
import { getTotalSizeAccount } from '../services/get-total-size-account';
import { getTotalSizeCloud } from '../services/get-total-size-cloud';

ipcMain.handle(
  'ipc-accounts-discovery',
  async (_, id: number, data: Cloud & { reset: boolean }): Promise<number | undefined | Error> => {
    try {
      const db = await openDb();

      
      const result = await db.run(
        'UPDATE clouds SET name=?, download_link=?, password=?, csv_links=?, output_dir=?, status=? WHERE id=?;',
        [data.name, data.download_link, data.password, data.csv_links, data.output_dir, data.status, id]
      );

      if (data.reset) {
        const OUTPUT_DIR = join(data.output_dir, "arquivo_de_producao");
        createDirectoryIfNotExists(OUTPUT_DIR);

        try {
          await downloadLink(data.download_link, join(OUTPUT_DIR, "producao.gpg"));
        } catch (error: any) {
          return new Error(`Erro ao baixar o arquivo: ${error.message}`);
        }

        // descriptografar o arquivo
        try {
          await decryptFile(join(data.output_dir, "arquivo_de_producao/producao.gpg"), join(data.output_dir, "arquivo_de_producao/producao"), data.password);
        } catch (error: any) {
          return new Error(`Erro ao descriptografar o arquivo baixado: ${error.message}`);
        }

        try {
          await unzipFile(join(data.output_dir, "arquivo_de_producao/producao.zip"));
        } catch (error: any) {
          return new Error(`Erro ao descompactar o arquivo descriptografado: ${error.message}`);
        }

        //descobrir o nome do aquivo de procucao dentro da pasta /Account_Data_Links/...-account-download-details.csv

        const _file_production_name = await discoverFileNameProduction(join(data.output_dir, "arquivo_de_producao"));

        const csvLinks = await readCSV<Link>(_file_production_name);
        await addLinks(csvLinks, id);
        const accountsLinks = await getAccountsByCloudId(id);
        createDirectoryIfNotExists(join(data.output_dir, 'accounts'));

        for (const link of accountsLinks) {
          const accountPath = join(data.output_dir, 'accounts', link.file_name);

          await downloadLink(link.file_link, accountPath);
          await decryptFile(accountPath, accountPath, data.password);

          const result = await unzipFile(`${accountPath}.zip`);

          const AppleID = readExcelCell(result, 'A8');
          const DSID = readExcelCell(result, 'B8');

          const cloud_size = await getTotalSizeAccount(link.confidential_id);
          const { lastID } = await addAccount({
            cloud_id: id,
            confidential_id: link.confidential_id,
            ds_id: DSID,
            email: AppleID,
            cloud_size,
            expiry_date: link.link_expiry_date,
            status: 'awaiting',
          });

          await db.run('UPDATE links SET account_id=? WHERE confidential_id=?;', [lastID, link.confidential_id]);
        }

        await removeFiles(join(data.output_dir, 'accounts'), ['.zip', '.gpg']);
      }

      if (result) {
        // atualizar o tamanho da nuvem
        const cloud_size = await getTotalSizeCloud(id);
        await db.run('UPDATE clouds SET cloud_size = ? WHERE id = ?;', [cloud_size, id]);
        return result.changes;
      }

      return new Error('Erro ao atualizar nuvem');
    } catch (error: any) {
      return new Error('Erro ao atualizar nuvem', error?.message);
    }
  }
);
