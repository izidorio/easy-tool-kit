import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  FilterFnOption,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { useState } from 'react';
import { useTarget } from './useTargets';
import { queryClient } from '@/renderer/src/providers';
import { toast } from '@/renderer/src/hooks/use-toast';
import { ScrollArea } from '@/renderer/src/components/ui/scroll-area';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const { setIsDialogOpen, resetValue } = useTarget();
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      fuzzy: (row, _, value) => {
        const data = row.original;
        const search = value.toLowerCase();
        return ['email', 'ds_id', 'name', 'analyst'].some((field) => {
          if (typeof data[field] === 'string') {
            return data[field].toString().toLowerCase().includes(search);
          }
          return false;
        });
      },
    },
    globalFilterFn: 'fuzzy' as FilterFnOption<TData>,
    state: {
      globalFilter,
    },
  });

  const handleNewTarget = () => {
    resetValue();
    setIsDialogOpen(true);
  };

  const handleImportTarget = async () => {
    const path = await window.api.selectFile([{ name: 'csv', extensions: ['csv'] }]);
    if (path) {
      const result = await window.api.importTarget(path);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['targets'] });
        toast({
          title: 'Sucesso!',
          description: 'Alvos importados com sucesso',
        });
      }
      if (result.error) {
        console.log(result);

        toast({
          title: 'Erro',
          description: result.error,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownloadTarget = async () => {
    const path = await window.api.selectDirectory();

    if (path) {
      const result = await window.api.exportTargets(path);
      if (result) {
        toast({
          title: 'Sucesso',
          description: 'Alvos exportados com sucesso',
        });
      }
      return;
    }
  };
  return (
    <div>
      <div className="flex items-center gap-8 justify-between py-4">
        <Input
          placeholder="Filtrar por: DSID, nome e email"
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNewTarget}>
            Novo alvo
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownloadTarget}>
            Baixar .csv
          </Button>

          <Button variant="outline" size="sm" onClick={handleImportTarget}>
            Importar .csv
          </Button>
        </div>
      </div>

      <ScrollArea className="rounded-md border h-[calc(100vh-8rem)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
