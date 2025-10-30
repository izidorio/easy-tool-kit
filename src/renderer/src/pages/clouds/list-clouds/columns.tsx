import { Button } from '@/renderer/src/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, ArrowUpDown, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/renderer/src/components/ui/dropdown-menu';
import { toast } from '@/renderer/src/hooks/use-toast';
import { Cloud } from '@/types';
import { TrashConfirmButton } from '@/renderer/src/components/trash-confirm-button';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/renderer/src/providers/query-client';
import { formatBytes } from '@/renderer/src/lib/utils';

export const columns: ColumnDef<Cloud>[] = [
  {
    accessorKey: 'actions',
    id: 'actions',
    header: () => null,
    size: 20,
    cell: ({ row }) => {
      const nav = useNavigate();

      async function handleDeleteCloud(cloudId: number) {
        try {
          const result = await window.api.deleteCloud(cloudId);

          if (result === false) {
            toast({
              title: 'Erro ao deletar nuvem',
              description: 'Não foi possível deletar a nuvem',
              variant: 'destructive',
            });
            return;
          }

          // Atualizar a lista de nuvens após a exclusão
          queryClient.invalidateQueries({ queryKey: ['clouds'] });

          toast({
            title: 'Sucesso',
            description: 'Nuvem deletada com sucesso',
          });
        } catch (error) {
          toast({
            title: 'Erro ao deletar nuvem',
            description: 'Ocorreu um erro ao tentar deletar a nuvem',
            variant: 'destructive',
          });
        }
      }

      return (
        <div className="flex items-center w-5" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4 m-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => nav(`/cloud/${row.original.id}`)} className="flex gap-2">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Editar nuvem
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TrashConfirmButton onAction={() => handleDeleteCloud(row.original.id!)}>
                  Excluir nuvem
                </TrashConfirmButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nome
          <ArrowUpDown className="ml-0 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="flex items-center w-[20rem] truncate">{row.getValue('name')}</div>;
    },
  },
  {
    accessorKey: 'cloud_size',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Tamanho
          <ArrowUpDown className="ml-0 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="flex items-center">{formatBytes(Number(row.original.cloud_size || '0'))}</div>;
    },
  },
  {
    accessorKey: 'accounts_total',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Contas
          <ArrowUpDown className="ml-0 h-4 w-4" />
        </Button>
      );
    },
    size: 10,
    cell: ({ row }) => {
      return <div className="text-center w-5">{row.getValue('accounts_total')}</div>;
    },
  },
];
