import { openDb } from "../../database/database";
import { Account } from "../../types";

export async function addAccount(data: Account) {
  const db = await openDb();

  const result = await db.run(
    "INSERT INTO accounts (cloud_id, confidential_id, ds_id, email, cloud_size, expiry_date) VALUES (?, ?, ?, ?, ?, ?)",
    data.cloud_id,
    data.confidential_id,
    data.ds_id,
    data.email,
    data.cloud_size,
    data.expiry_date
  );

  return result;
}
