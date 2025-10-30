export interface Link {
  id?: number;
  cloud_id: number;
  confidential_id: string;
  account_id?: number;
  data_type: string;
  file_name: string;
  file_link: string;
  file_type: string;
  gpg_size: string;
  gpg_sha256: string;
  link_expiry_date: string;
  status: string;
}
