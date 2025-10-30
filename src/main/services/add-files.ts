import { openDb } from "../../database/database";

export async function addFiles(files: string[]) {
  const db = await openDb();
  await db.run("DELETE FROM files");
  const insertFiles = await db.prepare(`
        INSERT INTO files (path)
        VALUES(?);
        `);

  for (const file of files) {
    await insertFiles.run(file);
  }

  await insertFiles.finalize();
}
