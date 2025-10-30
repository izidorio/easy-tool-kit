export interface Account {
  id?: number;
  cloud_id: number;
  confidential_id: string;
  ds_id: string;
  email: string;
  cloud_size?: string;
  total_links?: number;
  downloaded_links?: number;
  expiry_date?: string;
  alvo?: string;
  imei_number?: string;
  imei_number2?: string;
  status?: string;
}
