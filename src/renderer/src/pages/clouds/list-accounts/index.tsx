import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { DataTable } from './data-table';
import { columns } from './columns';
import { DialogTarget } from './dialog-target';

import * as Layout from '@renderer/components/layouts';
import { formatBytes } from '@/renderer/src/lib/utils';


function parseToKb(size: string): number {
  try {
    const cleanSize = size.trim().toUpperCase();
    const number = parseFloat(cleanSize.replace(/[^\d.,]/g, '').replace(',', '.'));

    if (cleanSize.includes('GB')) {
      return number * 1024 * 1024; // GB para KB
    } else if (cleanSize.includes('MB')) {
      return number * 1024; // MB para KB
    } else if (cleanSize.includes('KB')) {
      return number; // KB permanece KB
    } else {
      return number;
    }
  } catch (error) {
    return 0;
  }
}

export function ListAccounts() {
  const { cloud_id } = useParams();
 

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', cloud_id],
    queryFn: async () => {
      const result = await window.api.getAllAccountsByCloudId(cloud_id || '');
      if (result instanceof Error) {
        console.error(result);
        return [];
      }
      return result.map((account) => ({
        ...account,
        cloud_size_kb: parseToKb(account.cloud_size),
      }));
    },
    enabled: !!cloud_id,
  });

  const cloudName = accounts[0]?.cloud_name || '';
  const totalSize = accounts.reduce((acc, account) => acc + account.cloud_size_kb, 0);

  return (
    <Layout.Root>
      <Layout.Breadcrumb 
        links={[
          { name: 'Lista de nuvens', href: '/' },
          { name: `${cloudName} - ${formatBytes(Number(totalSize || '0'))}`, href: '#' },
        ]}
      />
      <Layout.Content className="py-0 h-[calc(100vh-80px)] w-full">
        <DataTable columns={columns} data={accounts} isLoading={isLoading} />

        <DialogTarget />
      </Layout.Content>
    </Layout.Root>
  );
}
