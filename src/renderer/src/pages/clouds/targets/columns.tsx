import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@renderer/components/ui/button';
import { CopyToClipboard } from '@renderer/components/copy-to-clipboard';

import { useTarget } from './useTargets';
import { Target } from '@/types';

export const columns: ColumnDef<Target>[] = [
  {
    accessorKey: 'ds_id',
    header: 'DS ID',
    cell: ({ row }) => {
      return <CopyToClipboard>{row.getValue('ds_id')}</CopyToClipboard>;
    },
  },
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => {
      return <CopyToClipboard>{row.getValue('name')}</CopyToClipboard>;
    },
  },

  {
    accessorKey: 'analyst',
    header: 'Analista',
    cell: ({ row }) => {
      return row.getValue('analyst');
    },
  },

  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      return <CopyToClipboard>{row.getValue('email')}</CopyToClipboard>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const target = row.original;
      const { setSelectedTarget, setIsDialogOpen } = useTarget();

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTarget(target);
              setIsDialogOpen(true);
            }}
          >
            Editar
          </Button>
        </div>
      );
    },
  },
];
