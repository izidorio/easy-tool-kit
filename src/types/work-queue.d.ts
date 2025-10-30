export interface WorkQueue {
  id?: number;
  link_id: number;
  cloud_id: number;
  confidential_id: string;
  ds_id: string;
  email: string;
  url: string;
  file_name: string;
  gpg_size: number;
  time_seconds: string;
  status: string;
}
