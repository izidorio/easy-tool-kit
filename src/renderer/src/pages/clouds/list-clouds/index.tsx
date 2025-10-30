import { Cloud } from '@/types';
import { useQuery } from '@tanstack/react-query';
import * as Layout from '@renderer/components/layouts';
import { DataTable } from './data-table';
import { columns } from './columns';

export function ListClouds() {
  const { data: clouds = [] } = useQuery<Cloud[]>({
    queryKey: ['clouds'],
    queryFn: async () => {
      const result = await window.api.getAllClouds();
      if (result instanceof Error) {
        console.error(result);
        return [];
      }
      return result;
    },
  });

  return (
    <Layout.Root>
      <Layout.Breadcrumb links={[{ name: 'Lista de nuvens', href: '#' }]} />
      <Layout.Content className="py-0">
        <DataTable columns={columns} data={clouds} />
      </Layout.Content>
    </Layout.Root>
  );
}
