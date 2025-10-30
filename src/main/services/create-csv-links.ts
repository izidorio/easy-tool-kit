import { Link } from '../../types';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'node:path';

interface createCsvLinksProps {
  links: Link[];
  output_dir: string;
  fileName: string;
}

export async function createCsvLinks({ output_dir, links, fileName }: createCsvLinksProps) {
  try {
    const csvWriter = createObjectCsvWriter({
      path: path.join(output_dir, fileName),
      header: [
        { id: 'data_type', title: 'Data_Type' },
        { id: 'file_name', title: 'File_Name' },
        { id: 'file_link', title: 'File_Link' },
        { id: 'file_type', title: 'File_Type' },
        { id: 'gpg_size', title: 'GPG_Size' },
        { id: 'gpg_sha256', title: 'GPG_SHA256' },
        { id: 'link_expiry_date', title: 'Link Expiry Date' },
      ],
      alwaysQuote: true,
    });

    await csvWriter.writeRecords(links);
    return true;
  } catch (error) {
    throw error;
  }
}
