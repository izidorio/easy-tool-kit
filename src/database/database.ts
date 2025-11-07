import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'node:path';
export type { Database };
export async function openDb(): Promise<Database> {
  let db: Database;
  try {
    db = await open({
      // filename: join(__dirname, "helper.db"),
      filename: join('.', 'helper.db'),
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS clouds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        password TEXT,
        accounts_total INTEGER,
        csv_links TEXT,
        output_dir TEXT,
        remove_temp_files INTEGER DEFAULT (1),
        status TEXT,
        created_at TEXT
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_id INTEGER,
        confidential_id TEXT,
        ds_id TEXT,
        email TEXT,
        cloud_size TEXT,
        total_links INTEGER,
        downloaded_links INTEGER DEFAULT (0),
        expiry_date TEXT,
        alvo TEXT,
        imei_number TEXT,
        imei_number2 TEXT,
        status TEXT,
        CONSTRAINT accounts_clouds_FK FOREIGN KEY (cloud_id) REFERENCES clouds(id) ON DELETE CASCADE
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloud_id INTEGER,
        account_id INTEGER,
        confidential_id TEXT,
        data_type TEXT,
        file_link TEXT,
        file_name TEXT,
        file_type TEXT,
        gpg_sha256 TEXT,
        gpg_size INTEGER,
        link_expiry_date TEXT,
        status TEXT DEFAULT ('pending'),
        CONSTRAINT links_clouds_FK FOREIGN KEY (cloud_id) REFERENCES clouds(id) ON DELETE CASCADE,
        CONSTRAINT accounts_clouds_FK FOREIGN KEY (account_id) REFERENCES acconunts(id) ON DELETE CASCADE
      );
    `);

    await db.exec(`
       CREATE TABLE IF NOT EXISTS work_queue (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         cloud_id INTEGER,
         confidential_id TEXT,
         link_id INTEGER,
         ds_id TEXT,
         email TEXT,
         url TEXT,
         file_name TEXT,
         gpg_size INTEGER,
         time_seconds INTEGER,
         status TEXT DEFAULT ('pending')
       );
     `);

    await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS work_queue_link_id_IDX ON work_queue (link_id);`);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ds_id TEXT,
        email TEXT,
        name TEXT,
        alias TEXT,
        document TEXT,
        analyst TEXT
      );
    `);

    await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS targets_ds_id_IDX ON targets (ds_id);`);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bash_path TEXT,
        iped_path TEXT
      );
    `);

    // Verificar se a coluna iped_path existe na tabela settings
    const tableInfo = await db.all('PRAGMA table_info(settings)');
    const hasIpedPathColumn = tableInfo.some((column) => column.name === 'iped_path');

    if (!hasIpedPathColumn) {
      await db.exec(`ALTER TABLE settings ADD COLUMN iped_path TEXT`);
      console.log('Coluna iped_path adicionada à tabela settings');
    }

    // verifica se existe a coluna cloud_size na tabela clouds
    const tableCloudsInfo = await db.all('PRAGMA table_info(clouds)');
    const hasCloudSizeColumn = tableCloudsInfo.some((column) => column.name === 'cloud_size');
    if (!hasCloudSizeColumn) {
      await db.exec(`ALTER TABLE clouds ADD COLUMN cloud_size TEXT`);
      console.log('Coluna cloud_size adicionada à tabela clouds');
    }

    // verifica se existe a coluna download_link na tabela clouds
    const hasLinkColumn = tableCloudsInfo.some((column) => column.name === 'download_link');
    if (!hasLinkColumn) {
      await db.exec(`ALTER TABLE clouds ADD COLUMN download_link TEXT`);
      console.log('Coluna link adicionada à tabela clouds');
    }
  } catch (error) {
    console.error('Erro ao abrir ou inicializar o banco de dados:', error);
    throw error; // Propaga o erro para que ele possa ser tratado em um nível superior
  }

  return db;
}
