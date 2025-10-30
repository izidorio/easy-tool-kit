import { useQuery } from '@tanstack/react-query';

import { DataTable } from './data-table';
import { columns } from './columns';
import { DialogTarget } from './dialog-target';

import * as Layout from '@renderer/components/layouts';

export function ListTargets() {
  const { data: targets = [] } = useQuery({
    queryKey: ['targets'],
    queryFn: () => window.api.getAllTargets(),
  });

  return (
    <Layout.Root>
      <Layout.Breadcrumb
        links={[
          { name: 'Lista de nuvens', href: '/' },
          { name: 'Alvos', href: '#' },
        ]}
      />
      <Layout.Content className="py-0">
        <DataTable columns={columns} data={targets} />
      </Layout.Content>
      <DialogTarget />
    </Layout.Root>
  );
}
