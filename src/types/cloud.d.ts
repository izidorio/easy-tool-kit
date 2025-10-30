export interface Cloud {
  id?: number;
  name: string;
  password: string;
  accounts_total?: number;
  links_dir: string;
  output_dir: string;
  status: string;
  csv_links: string;
  cloud_size?: string;
}
