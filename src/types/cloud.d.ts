export interface Cloud {
  id?: number;
  name: string;
  download_link: string;
  password: string;
  output_dir: string;
  accounts_total?: number;
  links_dir: string;
  status: string;
  csv_links?: string;
  cloud_size?: string;
}
