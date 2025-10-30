import { openDb } from "../../database/database";
import { Link } from "../../types";
import { parseToBytes } from "./parse-to-bytes";
import { sendLog } from "./send-logs";

export async function addLinks(links: Link[], cloud_id: number) {
  const db = await openDb();
  await db.run("DELETE FROM links WHERE cloud_id=?", cloud_id);
  await db.run("DELETE FROM accounts WHERE cloud_id = ?", cloud_id);

  try {
    const insertLinks = await db.prepare(`
        INSERT INTO links (cloud_id, data_type, file_name, file_link, file_type, gpg_sha256, gpg_size, link_expiry_date, confidential_id)
        VALUES(?,?, ?, ?, ?, ?, ?, ?, ?);
        `);

    for (const link of links) {
      const confidential_id = link["File_Name"].split("-")[0];

      await insertLinks.run(
        cloud_id,
        link["Data_Type"],
        link["File_Name"],
        link["File_Link"],
        link["File_Type"],
        link["GPG_SHA256"],
        parseToBytes(link["GPG_Size"]),
        link["Link Expiry Date"],
        confidential_id
      );

      sendLog(`Added link ${link["File_Name"]}`);
    }

    await insertLinks.finalize();
  } catch (error) {
    console.log(error);
  }
}
